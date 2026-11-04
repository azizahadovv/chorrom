package uz.chorrom.api.auth;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import uz.chorrom.api.config.AppProperties;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final JwtEncoder jwtEncoder;
    private final AppProperties props;

    public AuthController(JdbcTemplate jdbc, PasswordEncoder encoder, JwtEncoder jwtEncoder, AppProperties props) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.jwtEncoder = jwtEncoder;
        this.props = props;
    }

    public record LoginRequest(String email, String password) {}

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest req) {
        if (req.email() == null || req.password() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email va parol kerak");
        }
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id, email, name, role, status, password_hash FROM users WHERE lower(email) = lower(?)",
                req.email().trim());
        if (rows.isEmpty() || !encoder.matches(req.password(), (String) rows.get(0).get("password_hash"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email yoki parol noto'g'ri");
        }
        Map<String, Object> u = rows.get(0);
        if (!"active".equals(u.get("status"))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Akkaunt o'chirilgan");
        }
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(u.get("id").toString())
                .issuedAt(now)
                .expiresAt(now.plus(props.jwtTtlHours(), ChronoUnit.HOURS))
                .claim("role", u.get("role"))
                .claim("email", u.get("email"))
                .build();
        String token = jwtEncoder
                .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
        return Map.of("token", token, "user", publicUser(u));
    }

    /** Joriy foydalanuvchi (token haliyam yaroqli va akkaunt faol bo'lsa). */
    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {
        List<Map<String, Object>> rows = jdbc.queryForList(
                "SELECT id, email, name, role, status FROM users WHERE id = ?::uuid", jwt.getSubject());
        if (rows.isEmpty() || !"active".equals(rows.get(0).get("status"))) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Sessiya tugagan");
        }
        return publicUser(rows.get(0));
    }

    private static Map<String, Object> publicUser(Map<String, Object> u) {
        return Map.of(
                "id", u.get("id").toString(),
                "email", u.get("email"),
                "name", u.get("name") == null ? "" : u.get("name"),
                "role", u.get("role"),
                "status", u.get("status"));
    }
}
