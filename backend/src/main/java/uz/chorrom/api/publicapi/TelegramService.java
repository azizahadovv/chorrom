package uz.chorrom.api.publicapi;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.text.DecimalFormat;
import java.text.DecimalFormatSymbols;
import java.time.Duration;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import uz.chorrom.api.config.AppProperties;
import uz.chorrom.api.db.Rows;

/** Yangi ariza haqida Telegram xabari. Token: TELEGRAM_BOT_TOKEN (env) yoki admin paneldagi settings jadvali. */
@Service
public class TelegramService {

    private static final Logger log = LoggerFactory.getLogger(TelegramService.class);
    private final JdbcTemplate jdbc;
    private final ObjectMapper mapper;
    private final AppProperties props;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();

    public TelegramService(JdbcTemplate jdbc, ObjectMapper mapper, AppProperties props) {
        this.jdbc = jdbc;
        this.mapper = mapper;
        this.props = props;
    }

    public record Config(String token, String chatId, boolean enabled) {}

    public Config config() {
        Map<String, String> s = new HashMap<>();
        jdbc.queryForList("SELECT key, value FROM settings WHERE key LIKE 'telegram_%'")
                .forEach(r -> s.put((String) r.get("key"), (String) r.get("value")));
        String envToken = props.telegramBotToken();
        String token = envToken != null && !envToken.isBlank() ? envToken : s.getOrDefault("telegram_bot_token", "");
        return new Config(token, s.getOrDefault("telegram_chat_id", ""), "true".equals(s.get("telegram_enabled")));
    }

    @Async
    public void notifyLead(UUID leadId) {
        try {
            Config c = config();
            if (!c.enabled() || c.token().isBlank() || c.chatId().isBlank()) return;
            var rows = Rows.normalize(jdbc.queryForList("SELECT * FROM leads WHERE id = ?", leadId), mapper);
            if (rows.isEmpty()) return;
            send(c, format(rows.get(0)));
            jdbc.update("UPDATE leads SET notified_at = now() WHERE id = ?", leadId);
        } catch (Exception e) {
            log.warn("Telegram xabari yuborilmadi: {}", e.getMessage());
        }
    }

    /** Admin paneldagi "Test xabar" tugmasi. Xato bo'lsa sababini qaytaradi. */
    public String sendTest() {
        Config c = config();
        if (c.token().isBlank()) return "Bot token sozlanmagan";
        if (c.chatId().isBlank()) return "Chat ID sozlanmagan";
        try {
            send(c, "✅ <b>Test xabar</b>\n\nCHORROM sayti bilan aloqa o'rnatildi. Yangi arizalar shu chatga keladi.");
            return null;
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    private void send(Config c, String html) throws Exception {
        String body = mapper.writeValueAsString(Map.of("chat_id", c.chatId(), "text", html, "parse_mode", "HTML"));
        HttpRequest req = HttpRequest.newBuilder(URI.create("https://api.telegram.org/bot" + c.token() + "/sendMessage"))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body))
                .build();
        HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString());
        JsonNode json = mapper.readTree(res.body());
        if (!json.path("ok").asBoolean()) throw new IllegalStateException(json.path("description").asText("Telegram xatosi"));
    }

    private static String esc(Object v) {
        return v == null ? "" : v.toString().replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;");
    }

    private static String sum(JsonNode n) {
        DecimalFormatSymbols sym = new DecimalFormatSymbols();
        sym.setGroupingSeparator(' ');
        BigDecimal rounded = n.decimalValue().divide(BigDecimal.valueOf(1000)).setScale(0, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(1000));
        return new DecimalFormat("#,##0", sym).format(rounded) + " so'm";
    }

    private static String format(Map<String, Object> lead) {
        List<String> lines = new ArrayList<>();
        lines.add("📩 <b>Yangi ariza — CHORROM</b>");
        lines.add("");
        lines.add("📌 <b>Mavzu:</b> " + esc(lead.get("topic")));
        if (lead.get("name") != null) lines.add("👤 <b>Ism:</b> " + esc(lead.get("name")));
        lines.add("📞 <b>Telefon:</b> " + esc(lead.get("phone")));
        if (lead.get("page") != null) lines.add("🔗 <b>Sahifa:</b> " + esc(lead.get("page")));
        if (lead.get("details") instanceof JsonNode d) {
            d.fields().forEachRemaining(e -> lines.add("• " + esc(e.getKey()) + ": " + esc(e.getValue().asText())));
        }
        if (lead.get("calc") instanceof JsonNode c) {
            if (c.path("total").isNumber()) lines.add("💰 <b>Hisob:</b> " + sum(c.path("total")));
            if (c.path("monthly").isNumber()) lines.add("📅 <b>Oylik:</b> " + sum(c.path("monthly")));
            lines.add("");
            lines.add("<i>To'liq hisob admin paneldagi \"Arizalar\" bo'limida.</i>");
        }
        return String.join("\n", lines);
    }
}
