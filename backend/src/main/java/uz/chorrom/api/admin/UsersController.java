package uz.chorrom.api.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uz.chorrom.api.db.Rows;

/** Admin panel foydalanuvchilari (faqat admin roli; SecurityConfig'da cheklangan). */
@RestController
@RequestMapping("/api/admin/users")
public class UsersController {

    private static final Set<String> ROLES = Set.of("admin", "manager", "seller");
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final ObjectMapper mapper;

    public UsersController(JdbcTemplate jdbc, PasswordEncoder encoder, ObjectMapper mapper) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    @GetMapping
    public List<Map<String, Object>> list() {
        return Rows.normalize(jdbc.queryForList(
                "SELECT id, email, name, role, status, created_at FROM users ORDER BY created_at DESC"), mapper);
    }

    public record CreateUser(String email, String password, String name, String role) {}

    @PostMapping
    public Map<String, Object> create(@RequestBody CreateUser req) {
        if (req.email() == null || !req.email().contains("@")) throw bad("Email noto'g'ri");
        if (req.password() == null || req.password().length() < 8) throw bad("Parol kamida 8 belgi");
        String role = ROLES.contains(req.role()) ? req.role() : "manager";
        Integer exists = jdbc.queryForObject("SELECT count(*) FROM users WHERE lower(email) = lower(?)", Integer.class, req.email().trim());
        if (exists != null && exists > 0) throw bad("Bu email bilan foydalanuvchi bor");
        var rows = jdbc.queryForList(
                "INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, ?) RETURNING id, email, name, role, status, created_at",
                req.email().trim().toLowerCase(), encoder.encode(req.password()), req.name() == null ? "" : req.name().trim(), role);
        return Rows.normalizeRow(rows.get(0), mapper);
    }

    public record UpdateUser(String name, String role, String status, String password) {}

    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable String id, @RequestBody UpdateUser req, @AuthenticationPrincipal Jwt me) {
        if (req.role() != null && !ROLES.contains(req.role())) throw bad("Noto'g'ri rol");
        if (req.status() != null && !Set.of("active", "disabled").contains(req.status())) throw bad("Noto'g'ri holat");
        boolean self = id.equals(me.getSubject());
        if (self && ("disabled".equals(req.status()) || (req.role() != null && !"admin".equals(req.role())))) {
            throw bad("O'zingizni o'chira yoki rolingizni pasaytira olmaysiz");
        }
        if (req.password() != null && !req.password().isEmpty() && req.password().length() < 8) throw bad("Parol kamida 8 belgi");
        jdbc.update("UPDATE users SET name = COALESCE(?, name), role = COALESCE(?, role), status = COALESCE(?, status), "
                        + "password_hash = COALESCE(?, password_hash) WHERE id = ?::uuid",
                req.name(), req.role(), req.status(),
                req.password() == null || req.password().isEmpty() ? null : encoder.encode(req.password()), id);
        var rows = jdbc.queryForList("SELECT id, email, name, role, status, created_at FROM users WHERE id = ?::uuid", id);
        if (rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Topilmadi");
        return Rows.normalizeRow(rows.get(0), mapper);
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> delete(@PathVariable String id, @AuthenticationPrincipal Jwt me) {
        if (id.equals(me.getSubject())) throw bad("O'zingizni o'chira olmaysiz");
        jdbc.update("DELETE FROM users WHERE id = ?::uuid", id);
        return Map.of("ok", true);
    }

    private static ResponseStatusException bad(String msg) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg);
    }
}
