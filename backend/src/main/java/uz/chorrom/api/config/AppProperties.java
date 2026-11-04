package uz.chorrom.api.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** application.yml dagi "app.*" sozlamalari. */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String jwtSecret,
        int jwtTtlHours,
        String uploadDir,
        String uploadUrl,
        String adminEmail,
        String adminPassword,
        String telegramBotToken,
        String corsOrigins,
        Importer importer) {

    public record Importer(String supabaseUrl, String supabaseKey) {}
}
