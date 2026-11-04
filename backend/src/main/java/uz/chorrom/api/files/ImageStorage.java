package uz.chorrom.api.files;

import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.YearMonth;
import java.util.Iterator;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.Semaphore;
import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.ImageOutputStream;
import net.coobird.thumbnailator.Thumbnails;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import uz.chorrom.api.config.AppProperties;

/**
 * Yuklangan rasmlar diskda (UPLOAD_DIR). Har bir rastr rasm uchun 400/640/960 px WebP nusxalar yaratiladi:
 * /uploads/products/202610/abc.jpg → /uploads/products/202610/abc-640.webp (frontend LazyImage shu nomlarni ishlatadi).
 */
@Service
public class ImageStorage {

    public static final int[] WIDTHS = {400, 640, 960};
    private static final Logger log = LoggerFactory.getLogger(ImageStorage.class);
    private static final Set<String> RASTER = Set.of("jpg", "jpeg", "png", "webp");
    private static final Set<String> ALLOWED = Set.of("jpg", "jpeg", "png", "webp", "gif", "svg", "ico");

    /** Katta rasmni dekodlash xotira talab qiladi: bir vaqtda bittadan (server xotirasi chegaralangan) */
    private static final Semaphore RESIZE = new Semaphore(1);
    private final Path root;
    private final String publicUrl;

    public ImageStorage(AppProperties props) throws IOException {
        this.root = Path.of(props.uploadDir()).toAbsolutePath().normalize();
        this.publicUrl = props.uploadUrl().replaceAll("/+$", "");
        Files.createDirectories(root);
    }

    public String save(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Fayl bo'sh");
        String ct = file.getContentType() == null ? "" : file.getContentType();
        if (!ct.startsWith("image/")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Faqat rasm yuklash mumkin");
        return saveBytes(file.getBytes(), extension(file.getOriginalFilename(), ct), folder);
    }

    /** Rasmni saqlaydi va ommaviy URL'ni qaytaradi. */
    public String saveBytes(byte[] bytes, String ext, String folder) throws IOException {
        ext = ext.toLowerCase(Locale.ROOT);
        if (!ALLOWED.contains(ext)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rasm turi qo'llab-quvvatlanmaydi");
        String safeFolder = folder.replaceAll("[^a-z0-9-]", "");
        if (safeFolder.isEmpty()) safeFolder = "site";
        String ym = YearMonth.now().toString().replace("-", "");
        String name = UUID.randomUUID().toString().replace("-", "").substring(0, 16);
        Path dir = root.resolve(safeFolder).resolve(ym);
        Files.createDirectories(dir);
        Files.write(dir.resolve(name + "." + ext), bytes);
        if (RASTER.contains(ext)) writeVariants(bytes, dir, name);
        return publicUrl + "/" + safeFolder + "/" + ym + "/" + name + "." + ext;
    }

    private void writeVariants(byte[] bytes, Path dir, String name) {
        try {
            RESIZE.acquire();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return;
        }
        try {
            BufferedImage src = ImageIO.read(new ByteArrayInputStream(bytes));
            if (src == null) return;
            for (int w : WIDTHS) {
                BufferedImage img = src.getWidth() > w ? Thumbnails.of(src).width(w).asBufferedImage() : src;
                writeWebp(img, dir.resolve(name + "-" + w + ".webp"));
            }
        } catch (Exception e) {
            // nusxalar bo'lmasa sayt asl faylni ko'rsatadi
            log.warn("WebP nusxalar yaratilmadi ({}): {}", name, e.getMessage());
        } finally {
            RESIZE.release();
        }
    }

    private static void writeWebp(BufferedImage img, Path out) throws IOException {
        Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/webp");
        if (!writers.hasNext()) throw new IOException("WebP yozuvchi topilmadi");
        ImageWriter writer = writers.next();
        ImageWriteParam param = writer.getDefaultWriteParam();
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionType(param.getCompressionTypes()[0]); // lossy
        param.setCompressionQuality(0.75f);
        try (ImageOutputStream ios = ImageIO.createImageOutputStream(out.toFile())) {
            writer.setOutput(ios);
            writer.write(null, new IIOImage(img, null, null), param);
        } finally {
            writer.dispose();
        }
    }

    private static String extension(String filename, String contentType) {
        if (filename != null && filename.contains(".")) {
            String e = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase(Locale.ROOT);
            if (ALLOWED.contains(e)) return e;
        }
        return switch (contentType) {
            case "image/png" -> "png";
            case "image/webp" -> "webp";
            case "image/gif" -> "gif";
            case "image/svg+xml" -> "svg";
            case "image/x-icon", "image/vnd.microsoft.icon" -> "ico";
            default -> "jpg";
        };
    }
}
