package uz.chorrom.api.importer;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Component;
import uz.chorrom.api.config.AppProperties;
import uz.chorrom.api.db.TableRegistry;
import uz.chorrom.api.files.ImageStorage;

/**
 * Eski Lovable/Supabase bazasidan OCHIQ ma'lumotni bir marta ko'chiradi: kategoriyalar, mahsulotlar, sayt matnlari,
 * tizim sozlamalari va ulardagi rasmlar (UPLOAD_DIR'ga, WebP nusxalari bilan).
 * Faqat IMPORT_SUPABASE_URL berilgan va baza bo'sh (kategoriya yo'q) bo'lsa ishlaydi. Admin akkauntlari,
 * eski buyurtmalar va Telegram tokeni yopiq bo'lgani uchun ko'chmaydi.
 */
@Component
@Order(2)
public class SupabaseImporter implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(SupabaseImporter.class);
    private static final String STORAGE = "/storage/v1/object/public/";

    private final AppProperties props;
    private final NamedParameterJdbcTemplate jdbc;
    private final TableRegistry registry;
    private final ImageStorage images;
    private final ObjectMapper mapper;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(15))
            .followRedirects(HttpClient.Redirect.NORMAL).build();
    private final Map<String, String> imageMap = new HashMap<>();

    public SupabaseImporter(AppProperties props, NamedParameterJdbcTemplate jdbc, TableRegistry registry,
                            ImageStorage images, ObjectMapper mapper) {
        this.props = props;
        this.jdbc = jdbc;
        this.registry = registry;
        this.images = images;
        this.mapper = mapper;
    }

    @Override
    public void run(ApplicationArguments args) {
        AppProperties.Importer cfg = props.importer();
        if (cfg == null || cfg.supabaseUrl() == null || cfg.supabaseUrl().isBlank()) return;
        Integer cats = jdbc.getJdbcTemplate().queryForObject("SELECT count(*) FROM categories", Integer.class);
        if (cats != null && cats > 0) {
            log.info("Import o'tkazib yuborildi: bazada allaqachon kategoriyalar bor");
            return;
        }
        try {
            String base = cfg.supabaseUrl().replaceAll("/+$", "");
            JsonNode categories = get(base, cfg.supabaseKey(), "categories?select=*");
            JsonNode products = get(base, cfg.supabaseKey(), "products?select=*");
            JsonNode content = get(base, cfg.supabaseKey(), "site_content?select=*");
            JsonNode settings = get(base, cfg.supabaseKey(), "system_settings?select=*&limit=1");

            for (JsonNode c : categories) insert("categories", c, "categories");
            for (JsonNode p : products) insert("products", p, "products");
            for (JsonNode s : content) insert("site_content", s, "site");
            if (settings.size() > 0) {
                jdbc.getJdbcTemplate().update("DELETE FROM system_settings");
                insert("system_settings", settings.get(0), "branding");
            }
            mapContactKeys();
            log.info("Import tugadi: {} kategoriya, {} mahsulot, {} matn, {} rasm",
                    categories.size(), products.size(), content.size(), imageMap.size());
        } catch (Exception e) {
            log.error("Import xatosi: {}", e.getMessage(), e);
        }
    }

    private JsonNode get(String base, String key, String path) throws Exception {
        HttpRequest req = HttpRequest.newBuilder(URI.create(base + "/rest/v1/" + path))
                .header("apikey", key).header("Authorization", "Bearer " + key).GET().build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (res.statusCode() != 200) throw new IllegalStateException(path + " → HTTP " + res.statusCode());
        return mapper.readTree(res.body());
    }

    /** Bitta qatorni o'z ID'si bilan qo'shadi; bizda yo'q ustunlar tashlab ketiladi, rasm URL'lari ko'chiriladi. */
    private void insert(String table, JsonNode row, String folder) throws Exception {
        Map<String, String> cols = registry.columns(table);
        MapSqlParameterSource params = new MapSqlParameterSource();
        List<String> names = new ArrayList<>();
        List<String> values = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> it = row.fields();
        int i = 0;
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            String type = cols.get(e.getKey());
            if (type == null) continue;
            String p = "p" + (i++);
            names.add(e.getKey());
            values.add("CAST(:" + p + " AS " + type + ")");
            params.addValue(p, convert(type, e.getValue(), folder));
        }
        jdbc.update("INSERT INTO " + table + " (" + String.join(", ", names) + ") VALUES (" + String.join(", ", values)
                + ") ON CONFLICT DO NOTHING", params);
    }

    private Object convert(String type, JsonNode v, String folder) throws Exception {
        if (v == null || v.isNull()) return null;
        if (type.equals("jsonb") || type.equals("json")) return v.toString();
        if (type.endsWith("[]")) {
            String[] arr = new String[v.size()];
            for (int k = 0; k < v.size(); k++) arr[k] = image(v.get(k).asText(), folder);
            return arr;
        }
        return v.isTextual() ? image(v.asText(), folder) : v.toString();
    }

    /** Supabase Storage manzili bo'lsa rasmni yuklab olib, yangi /uploads manzilini qaytaradi. */
    private String image(String value, String folder) {
        if (value == null || !value.contains(STORAGE)) return value;
        String clean = value.split("[?#]")[0];
        return imageMap.computeIfAbsent(clean, url -> {
            try {
                HttpResponse<byte[]> res = http.send(HttpRequest.newBuilder(URI.create(url)).GET().build(),
                        HttpResponse.BodyHandlers.ofByteArray());
                if (res.statusCode() != 200) return url;
                Matcher m = Pattern.compile("\\.([A-Za-z0-9]+)$").matcher(url);
                String ext = m.find() ? m.group(1) : "jpg";
                return images.saveBytes(res.body(), ext, folder);
            } catch (Exception e) {
                log.warn("Rasm ko'chmadi: {} ({})", url, e.getMessage());
                return url;
            }
        });
    }

    /** Admin avval kiritgan aloqa havolalari yangi dizayn kalitlariga (yangi kalit bo'lmasa). */
    private void mapContactKeys() {
        var j = jdbc.getJdbcTemplate();
        String telegram = firstNonBlank(
                value("contact_telegram_link"),
                j.queryForList("SELECT social_telegram FROM system_settings LIMIT 1", String.class).stream().findFirst().orElse(null));
        if (telegram != null) {
            putContent("common.contact.telegramUrl", telegram);
            Matcher m = Pattern.compile("t\\.me/([A-Za-z0-9_]+)").matcher(telegram);
            if (m.find()) putContent("common.contact.telegram", "@" + m.group(1));
        }
        j.queryForList("SELECT social_instagram FROM system_settings LIMIT 1", String.class).stream().findFirst()
                .filter(s -> s != null && !s.isBlank()).ifPresent(s -> putContent("common.contact.instagramUrl", s));
        String map = value("contact_yandex_map_link");
        if (map != null) putContent("common.contact.mapUrl", map);
        j.update("UPDATE system_settings SET seo_title = 'CHORROM — deraza va eshiklar, Buxoro' "
                + "WHERE seo_title IS NULL OR seo_title = '' OR seo_title ILIKE '%hashamatli%' OR seo_title ILIKE '%mebel%'");
        j.update("UPDATE system_settings SET primary_domain = 'https://chorrom.uz' WHERE primary_domain IS NULL OR primary_domain ILIKE '%lovable%'");
        // Eski bazadagi favicon — yozuvli to'liq logotip (yorliqda o'qib bo'lmaydi): saytning o'z belgisi (/favicon.svg) qoladi
        j.update("UPDATE system_settings SET favicon_url = NULL");
    }

    private String value(String key) {
        return jdbc.getJdbcTemplate().queryForList("SELECT value_uz FROM site_content WHERE key = ?", String.class, key)
                .stream().filter(s -> s != null && !s.isBlank()).findFirst().orElse(null);
    }

    private void putContent(String key, String v) {
        jdbc.getJdbcTemplate().update(
                "INSERT INTO site_content (key, value_uz, value_ru, content_type, page) VALUES (?, ?, ?, 'text', 'common') ON CONFLICT (key) DO NOTHING",
                key, v, v);
    }

    private static String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        return b != null && !b.isBlank() ? b : null;
    }
}
