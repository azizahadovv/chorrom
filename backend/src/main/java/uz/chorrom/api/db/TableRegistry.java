package uz.chorrom.api.db;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Jadval API'si orqali ochiq jadvallar va ularning ruxsatlari (frontend src/lib/permissions.ts bilan mos).
 * Ro'yxatda yo'q jadval (masalan users) bu API orqali umuman ko'rinmaydi.
 */
@Component
public class TableRegistry {

    public static final String ANON = "anon";
    private static final Set<String> STAFF = Set.of("admin", "manager", "seller");
    private static final Set<String> EDITORS = Set.of("admin", "manager");
    private static final Set<String> ADMIN = Set.of("admin");
    private static final Set<String> NOBODY = Set.of();
    private static final Set<String> PUBLIC_READ = Set.of(ANON, "admin", "manager", "seller");

    public record Policy(Set<String> read, Set<String> insert, Set<String> update, Set<String> delete) {}

    private static final Map<String, Policy> POLICIES = Map.of(
            "categories", new Policy(PUBLIC_READ, EDITORS, EDITORS, EDITORS),
            "products", new Policy(PUBLIC_READ, EDITORS, EDITORS, EDITORS),
            "site_content", new Policy(PUBLIC_READ, EDITORS, EDITORS, EDITORS),
            "system_settings", new Policy(PUBLIC_READ, ADMIN, ADMIN, NOBODY),
            "price_settings", new Policy(PUBLIC_READ, EDITORS, EDITORS, NOBODY),
            // arizalar saytdan faqat /api/public/leads orqali tushadi
            "leads", new Policy(STAFF, NOBODY, STAFF, ADMIN),
            // Telegram tokeni shu yerda: mehmonga yopiq
            "settings", new Policy(EDITORS, EDITORS, EDITORS, ADMIN));

    private final JdbcTemplate jdbc;
    private volatile Map<String, Map<String, String>> columns;

    public TableRegistry(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public Policy policy(String table) {
        return POLICIES.get(table);
    }

    /** Ustun nomi → SQL turi (CAST uchun): uuid, text, integer, numeric, boolean, jsonb, timestamptz, text[] ... */
    public Map<String, String> columns(String table) {
        if (columns == null) {
            synchronized (this) {
                if (columns == null) columns = loadColumns();
            }
        }
        return columns.getOrDefault(table, Map.of());
    }

    private Map<String, Map<String, String>> loadColumns() {
        Map<String, Map<String, String>> result = new HashMap<>();
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns "
                        + "WHERE table_schema = 'public' ORDER BY table_name, ordinal_position");
        for (Map<String, Object> r : rows) {
            String table = (String) r.get("table_name");
            if (!POLICIES.containsKey(table)) continue;
            String dataType = (String) r.get("data_type");
            String udt = (String) r.get("udt_name");
            String sqlType = switch (dataType) {
                case "ARRAY" -> udt.startsWith("_") ? udt.substring(1) + "[]" : "text[]";
                case "timestamp with time zone" -> "timestamptz";
                case "timestamp without time zone" -> "timestamp";
                case "character varying" -> "text";
                default -> dataType;
            };
            result.computeIfAbsent(table, k -> new LinkedHashMap<>()).put((String) r.get("column_name"), sqlType);
        }
        return result;
    }
}
