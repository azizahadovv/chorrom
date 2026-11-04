package uz.chorrom.api.publicapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uz.chorrom.api.db.Rows;

/** Sayt uchun ochiq API: kontent, katalog, narxlar, sozlamalar va ariza qabul qilish. */
@RestController
@RequestMapping("/api/public")
public class PublicController {

    // Har safar tekshiriladi (ETag bilan: o'zgarmagan bo'lsa 304) — admin saqlagan narsa darhol ko'rinadi
    private static final CacheControl SHORT_CACHE = CacheControl.noCache();

    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final TelegramService telegram;
    /** IP → so'nggi arizalar vaqti (spamga qarshi: 1 daqiqada 5 ta, 1 soatda 20 ta) */
    private final Map<String, Deque<Instant>> recent = new ConcurrentHashMap<>();

    public PublicController(JdbcTemplate jdbc, ObjectMapper mapper, TelegramService telegram) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.telegram = telegram;
    }

    @GetMapping("/content")
    public ResponseEntity<List<Map<String, Object>>> content() {
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(Rows.normalize(jdbc.queryForList(
                "SELECT id, key, value_uz, value_ru, content_type, page, section FROM site_content"), mapper));
    }

    @GetMapping("/catalog")
    public ResponseEntity<Map<String, Object>> catalog() {
        var categories = jdbc.queryForList(
                "SELECT id, slug, name_uz, name_ru, image, sort_order FROM categories WHERE is_active ORDER BY sort_order, name_uz");
        var products = jdbc.queryForList(
                "SELECT id, slug, category_id, name_uz, name_ru, brand, chips_uz, chips_ru, place, price, calc_material, "
                        + "calc_series, images, is_featured, sort_order, chambers, thickness, uw_value, sound_db, "
                        + "warranty_years, suitable_uz, suitable_ru FROM products WHERE is_active ORDER BY sort_order, created_at");
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(Map.of(
                "categories", Rows.normalize(categories, mapper),
                "products", Rows.normalize(products, mapper)));
    }

    /** Narx sozlamalari (yo'q bo'lsa data: null — sayt "narxni menejer aytadi" rejimida). */
    @GetMapping("/prices")
    public ResponseEntity<Map<String, Object>> prices() {
        var rows = Rows.normalize(jdbc.queryForList("SELECT data FROM price_settings WHERE id = 1"), mapper);
        Object data = rows.isEmpty() ? null : rows.get(0).get("data");
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(data == null ? Map.of() : Map.of("data", data));
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> settings() {
        var rows = Rows.normalize(jdbc.queryForList("SELECT * FROM system_settings ORDER BY created_at LIMIT 1"), mapper);
        return ResponseEntity.ok().cacheControl(SHORT_CACHE).body(rows.isEmpty() ? Map.of() : rows.get(0));
    }

    public record LeadRequest(String name, String phone, String topic, String page, JsonNode calc, JsonNode details) {}

    /** Saytdagi barcha formalar shu yerga yozadi; Telegram xabarnomasi fon rejimida yuboriladi. */
    @PostMapping("/leads")
    public ResponseEntity<Map<String, Object>> lead(@RequestBody LeadRequest req, HttpServletRequest http) {
        String phone = normalizePhone(req.phone());
        if (phone == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Telefon raqam +998 XX XXX XX XX ko'rinishida bo'lsin");
        }
        String ip = http.getRemoteAddr();
        if (!allow(ip)) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Juda ko'p ariza. Birozdan keyin urinib ko'ring.");
        }
        String calc = json(req.calc(), 20000);
        String details = json(req.details(), 4000);
        UUID id = jdbc.queryForObject(
                "INSERT INTO leads (name, phone, topic, page, calc, details, ip) VALUES (?, ?, ?, ?, CAST(? AS jsonb), CAST(? AS jsonb), ?) RETURNING id",
                UUID.class,
                trim(req.name(), 120), phone, trim(req.topic(), 200), trim(req.page(), 300), calc, details, ip);
        telegram.notifyLead(id);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of("ok", true));
    }

    static String normalizePhone(String raw) {
        if (raw == null) return null;
        String d = raw.replaceAll("[^0-9]", "");
        if (d.length() == 9) d = "998" + d;
        return d.matches("998[0-9]{9}") ? "+" + d : null;
    }

    private boolean allow(String ip) {
        Instant now = Instant.now();
        Deque<Instant> q = recent.computeIfAbsent(ip, k -> new ArrayDeque<>());
        synchronized (q) {
            while (!q.isEmpty() && q.peekFirst().isBefore(now.minus(Duration.ofHours(1)))) q.pollFirst();
            long lastMinute = q.stream().filter(t -> t.isAfter(now.minus(Duration.ofMinutes(1)))).count();
            if (lastMinute >= 5 || q.size() >= 20) return false;
            q.addLast(now);
            return true;
        }
    }

    private String json(JsonNode node, int maxLen) {
        if (node == null || node.isNull()) return null;
        String s = node.toString();
        if (s.length() > maxLen) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Ma'lumot juda katta");
        return s;
    }

    private static String trim(String s, int max) {
        if (s == null) return null;
        String t = s.trim();
        return t.length() > max ? t.substring(0, max) : t;
    }
}
