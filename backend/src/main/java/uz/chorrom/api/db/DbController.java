package uz.chorrom.api.db;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

/**
 * Admin panel uchun jadval API'si (supabase-js uslubidagi frontend mijozi src/lib/db.ts shu yerga murojaat qiladi).
 * Faqat TableRegistry'dagi jadvallar va ustunlar; har bir amal rol bo'yicha tekshiriladi; qiymatlar parametr sifatida.
 *
 * select: { select, filters:[{column,op,value}], or:[...], order:[{column,ascending}], range:[from,to], limit, count, head }
 * insert: { rows:[{...}] }   update: { values:{...}, filters }   delete: { filters }   upsert: { rows, onConflict }
 */
@RestController
@RequestMapping("/api/db/{table}")
public class DbController {

    private static final Set<String> OPS = Set.of("eq", "neq", "gt", "gte", "lt", "lte", "in", "ilike", "is");

    private final TableRegistry registry;
    private final NamedParameterJdbcTemplate jdbc;
    private final ObjectMapper mapper;

    public DbController(TableRegistry registry, NamedParameterJdbcTemplate jdbc, ObjectMapper mapper) {
        this.registry = registry;
        this.jdbc = jdbc;
        this.mapper = mapper;
    }

    // ---------------------------------------------------------------- amallar

    @PostMapping("/select")
    public Map<String, Object> select(@PathVariable String table, @RequestBody ObjectNode body) {
        Map<String, String> cols = authorize(table, "read");
        Query q = new Query(cols);
        String where = q.where(body.path("filters"), body.path("or"));

        Map<String, Object> result = new HashMap<>();
        if ("exact".equals(body.path("count").asText(null))) {
            Long count = jdbc.queryForObject("SELECT count(*) FROM " + table + where, q.params, Long.class);
            result.put("count", count);
        }
        if (body.path("head").asBoolean(false)) {
            result.put("data", null);
            return result;
        }
        StringBuilder sql = new StringBuilder("SELECT ").append(selectList(body.path("select").asText("*"), cols))
                .append(" FROM ").append(table).append(where);
        List<String> order = new ArrayList<>();
        for (JsonNode o : body.path("order")) {
            String c = column(cols, o.path("column").asText());
            order.add(c + (o.path("ascending").asBoolean(true) ? " ASC" : " DESC") + " NULLS LAST");
        }
        if (!order.isEmpty()) sql.append(" ORDER BY ").append(String.join(", ", order));
        JsonNode range = body.path("range");
        if (range.isArray() && range.size() == 2) {
            long from = Math.max(0, range.get(0).asLong());
            long to = Math.max(from, range.get(1).asLong());
            sql.append(" LIMIT ").append(to - from + 1).append(" OFFSET ").append(from);
        } else if (body.hasNonNull("limit")) {
            sql.append(" LIMIT ").append(Math.max(0, Math.min(10000, body.get("limit").asInt())));
        }
        result.put("data", Rows.normalize(jdbc.queryForList(sql.toString(), q.params), mapper));
        return result;
    }

    @PostMapping("/insert")
    @Transactional
    public Map<String, Object> insert(@PathVariable String table, @RequestBody ObjectNode body) {
        Map<String, String> cols = authorize(table, "insert");
        List<Map<String, Object>> out = new ArrayList<>();
        for (JsonNode row : rows(body)) out.add(insertRow(table, cols, row, null));
        return Map.of("data", out);
    }

    @PostMapping("/upsert")
    @Transactional
    public Map<String, Object> upsert(@PathVariable String table, @RequestBody ObjectNode body) {
        Map<String, String> cols = authorize(table, "insert");
        authorize(table, "update");
        String conflict = column(cols, body.path("onConflict").asText("id"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (JsonNode row : rows(body)) out.add(insertRow(table, cols, row, conflict));
        return Map.of("data", out);
    }

    @PostMapping("/update")
    @Transactional
    public Map<String, Object> update(@PathVariable String table, @RequestBody ObjectNode body) {
        Map<String, String> cols = authorize(table, "update");
        Query q = new Query(cols);
        String where = q.where(body.path("filters"), body.path("or"));
        if (where.isEmpty()) throw bad("update uchun filtr kerak");
        List<String> sets = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> it = body.path("values").fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            String c = column(cols, e.getKey());
            if (c.equals("id") || c.equals("created_at") || c.equals("updated_at")) continue;
            sets.add(c + " = " + q.param(c, e.getValue()));
        }
        if (sets.isEmpty()) throw bad("o'zgartiriladigan maydon yo'q");
        String sql = "UPDATE " + table + " SET " + String.join(", ", sets) + where + " RETURNING *";
        return Map.of("data", Rows.normalize(jdbc.queryForList(sql, q.params), mapper));
    }

    @PostMapping("/delete")
    @Transactional
    public Map<String, Object> delete(@PathVariable String table, @RequestBody ObjectNode body) {
        Map<String, String> cols = authorize(table, "delete");
        Query q = new Query(cols);
        String where = q.where(body.path("filters"), body.path("or"));
        if (where.isEmpty()) throw bad("delete uchun filtr kerak");
        String sql = "DELETE FROM " + table + where + " RETURNING *";
        return Map.of("data", Rows.normalize(jdbc.queryForList(sql, q.params), mapper));
    }

    // ---------------------------------------------------------------- yordamchilar

    private Map<String, Object> insertRow(String table, Map<String, String> cols, JsonNode row, String conflict) {
        Query q = new Query(cols);
        List<String> names = new ArrayList<>();
        List<String> values = new ArrayList<>();
        Iterator<Map.Entry<String, JsonNode>> it = row.fields();
        while (it.hasNext()) {
            Map.Entry<String, JsonNode> e = it.next();
            String c = column(cols, e.getKey());
            if (c.equals("created_at") || c.equals("updated_at")) continue;
            names.add(c);
            values.add(q.param(c, e.getValue()));
        }
        if (names.isEmpty()) throw bad("bo'sh qator");
        StringBuilder sql = new StringBuilder("INSERT INTO ").append(table).append(" (").append(String.join(", ", names))
                .append(") VALUES (").append(String.join(", ", values)).append(")");
        if (conflict != null) {
            String updates = names.stream().filter(n -> !n.equals(conflict) && !n.equals("id"))
                    .map(n -> n + " = EXCLUDED." + n).collect(Collectors.joining(", "));
            sql.append(" ON CONFLICT (").append(conflict).append(") DO ")
                    .append(updates.isEmpty() ? "NOTHING" : "UPDATE SET " + updates);
        }
        sql.append(" RETURNING *");
        List<Map<String, Object>> res = jdbc.queryForList(sql.toString(), q.params);
        return res.isEmpty() ? Map.of() : Rows.normalizeRow(res.get(0), mapper);
    }

    private static List<JsonNode> rows(ObjectNode body) {
        JsonNode rows = body.path("rows");
        List<JsonNode> list = new ArrayList<>();
        if (rows.isArray()) rows.forEach(list::add);
        else if (rows.isObject()) list.add(rows);
        if (list.isEmpty() || list.size() > 500) throw bad("rows: 1..500 ta qator");
        return list;
    }

    private Map<String, String> authorize(String table, String action) {
        TableRegistry.Policy p = registry.policy(table);
        if (p == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Jadval yo'q");
        Set<String> allowed = switch (action) {
            case "read" -> p.read();
            case "insert" -> p.insert();
            case "update" -> p.update();
            default -> p.delete();
        };
        Set<String> roles = currentRoles();
        if (allowed.stream().noneMatch(roles::contains)) {
            throw new ResponseStatusException(roles.contains(TableRegistry.ANON) ? HttpStatus.UNAUTHORIZED : HttpStatus.FORBIDDEN,
                    "Ruxsat yo'q");
        }
        return registry.columns(table);
    }

    private static Set<String> currentRoles() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getAuthorities().isEmpty()
                || auth.getAuthorities().stream().allMatch(a -> a.getAuthority().equals("ROLE_ANONYMOUS"))) {
            return Set.of(TableRegistry.ANON);
        }
        return auth.getAuthorities().stream().map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_")).map(a -> a.substring(5)).collect(Collectors.toSet());
    }

    private static String column(Map<String, String> cols, String name) {
        if (name == null || !cols.containsKey(name)) throw bad("Noma'lum ustun: " + name);
        return name;
    }

    private static String selectList(String select, Map<String, String> cols) {
        if (select == null || select.isBlank() || select.trim().equals("*")) return "*";
        List<String> list = new ArrayList<>();
        for (String s : select.split(",")) list.add(column(cols, s.trim()));
        return String.join(", ", list);
    }

    private static ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }

    /** Parametrlar va WHERE qismi; har bir qiymat ustun turiga CAST qilinadi. */
    private final class Query {
        final Map<String, String> cols;
        final MapSqlParameterSource params = new MapSqlParameterSource();
        int n = 0;

        Query(Map<String, String> cols) {
            this.cols = cols;
        }

        String param(String column, JsonNode value) {
            String name = "p" + (n++);
            String type = cols.get(column);
            params.addValue(name, convert(type, value));
            return "CAST(:" + name + " AS " + type + ")";
        }

        Object convert(String type, JsonNode v) {
            if (v == null || v.isNull() || v.isMissingNode()) return null;
            if (type.equals("jsonb") || type.equals("json")) {
                try {
                    return mapper.writeValueAsString(v);
                } catch (Exception e) {
                    throw bad("JSON xato");
                }
            }
            if (type.endsWith("[]")) {
                if (!v.isArray()) throw bad("massiv kutilgan");
                String[] arr = new String[v.size()];
                for (int i = 0; i < v.size(); i++) arr[i] = v.get(i).isNull() ? null : v.get(i).asText();
                return arr;
            }
            return v.isTextual() ? v.asText() : v.toString();
        }

        String condition(JsonNode f) {
            String c = column(cols, f.path("column").asText());
            String op = f.path("op").asText("eq");
            if (!OPS.contains(op)) throw bad("Noma'lum amal: " + op);
            JsonNode v = f.path("value");
            return switch (op) {
                case "is" -> c + (v.isNull() ? " IS NULL" : (v.asBoolean() ? " IS TRUE" : " IS FALSE"));
                case "in" -> {
                    if (!v.isArray() || v.isEmpty()) yield "FALSE";
                    List<String> ps = new ArrayList<>();
                    v.forEach(x -> ps.add(param(c, x)));
                    yield c + " IN (" + String.join(", ", ps) + ")";
                }
                case "ilike" -> {
                    String name = "p" + (n++);
                    params.addValue(name, v.asText().replace('*', '%'));
                    yield c + "::text ILIKE :" + name;
                }
                default -> c + " " + switch (op) {
                    case "eq" -> "=";
                    case "neq" -> "<>";
                    case "gt" -> ">";
                    case "gte" -> ">=";
                    case "lt" -> "<";
                    default -> "<=";
                } + " " + param(c, v);
            };
        }

        String where(JsonNode filters, JsonNode or) {
            List<String> parts = new ArrayList<>();
            for (JsonNode f : filters) parts.add(condition(f));
            if (or.isArray() && !or.isEmpty()) {
                List<String> any = new ArrayList<>();
                for (JsonNode f : or) any.add(condition(f));
                parts.add("(" + String.join(" OR ", any) + ")");
            }
            return parts.isEmpty() ? "" : " WHERE " + String.join(" AND ", parts);
        }
    }
}
