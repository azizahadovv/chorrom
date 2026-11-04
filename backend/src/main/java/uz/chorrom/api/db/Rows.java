package uz.chorrom.api.db;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.sql.Array;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.postgresql.util.PGobject;

/** JDBC qiymatlarini JSON'ga qulay ko'rinishga o'tkazadi (jsonb → obyekt, massiv → ro'yxat, vaqt → ISO). */
public final class Rows {

    private Rows() {}

    public static List<Map<String, Object>> normalize(List<Map<String, Object>> rows, ObjectMapper mapper) {
        List<Map<String, Object>> out = new ArrayList<>(rows.size());
        for (Map<String, Object> row : rows) out.add(normalizeRow(row, mapper));
        return out;
    }

    public static Map<String, Object> normalizeRow(Map<String, Object> row, ObjectMapper mapper) {
        Map<String, Object> out = new LinkedHashMap<>();
        row.forEach((k, v) -> out.put(k, value(v, mapper)));
        return out;
    }

    private static Object value(Object v, ObjectMapper mapper) {
        try {
            if (v instanceof PGobject pg) {
                if (pg.getValue() == null) return null;
                if ("json".equals(pg.getType()) || "jsonb".equals(pg.getType())) return mapper.readTree(pg.getValue());
                return pg.getValue();
            }
            if (v instanceof Array arr) return Arrays.asList((Object[]) arr.getArray());
            if (v instanceof UUID u) return u.toString();
            if (v instanceof Timestamp ts) return ts.toInstant().toString();
            return v;
        } catch (SQLException | java.io.IOException e) {
            throw new IllegalStateException(e);
        }
    }
}
