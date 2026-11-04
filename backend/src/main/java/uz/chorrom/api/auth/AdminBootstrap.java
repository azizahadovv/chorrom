package uz.chorrom.api.auth;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import uz.chorrom.api.config.AppProperties;

/** Bazada birorta foydalanuvchi bo'lmasa, ADMIN_EMAIL / ADMIN_PASSWORD bilan birinchi adminni yaratadi. */
@Component
@Order(1)
public class AdminBootstrap implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);
    private final JdbcTemplate jdbc;
    private final PasswordEncoder encoder;
    private final AppProperties props;

    public AdminBootstrap(JdbcTemplate jdbc, PasswordEncoder encoder, AppProperties props) {
        this.jdbc = jdbc;
        this.encoder = encoder;
        this.props = props;
    }

    @Override
    public void run(ApplicationArguments args) {
        Integer count = jdbc.queryForObject("SELECT count(*) FROM users", Integer.class);
        if (count != null && count > 0) return;
        String email = props.adminEmail();
        String password = props.adminPassword();
        if (email == null || email.isBlank() || password == null || password.length() < 8) {
            log.warn("Foydalanuvchi yo'q: ADMIN_EMAIL va ADMIN_PASSWORD (kamida 8 belgi) berilsa birinchi admin yaratiladi");
            return;
        }
        jdbc.update("INSERT INTO users (email, password_hash, name, role) VALUES (?, ?, ?, 'admin')",
                email.trim().toLowerCase(), encoder.encode(password), "Admin");
        log.info("Birinchi admin yaratildi: {}", email);
    }
}
