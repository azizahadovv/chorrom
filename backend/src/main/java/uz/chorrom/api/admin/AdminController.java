package uz.chorrom.api.admin;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import uz.chorrom.api.files.ImageStorage;
import uz.chorrom.api.publicapi.TelegramService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TelegramService telegram;
    private final ImageStorage images;

    public AdminController(TelegramService telegram, ImageStorage images) {
        this.telegram = telegram;
        this.images = images;
    }

    @PostMapping("/telegram/test")
    @PreAuthorize("hasAnyRole('admin','manager')")
    public ResponseEntity<Map<String, Object>> telegramTest() {
        String error = telegram.sendTest();
        return error == null
                ? ResponseEntity.ok(Map.of("success", true))
                : ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", error));
    }

    /** Rasm yuklash: asl fayl + 400/640/960 px WebP nusxalar. Javobdagi url saytda ishlatiladi. */
    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('admin','manager')")
    public Map<String, Object> upload(@RequestParam("file") MultipartFile file,
                                      @RequestParam(value = "folder", defaultValue = "site") String folder) throws Exception {
        return Map.of("url", images.save(file, folder));
    }
}
