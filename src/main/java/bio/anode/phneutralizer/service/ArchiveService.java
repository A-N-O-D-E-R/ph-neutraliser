package bio.anode.phneutralizer.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.anode.b2.B2Service;

import lombok.extern.slf4j.Slf4j;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.stream.Stream;
import java.util.zip.GZIPOutputStream;

@Service
@Slf4j
public class ArchiveService {

    private static final int ARCHIVE_AFTER_DAYS = 7;
    private static final String[] LOG_PREFIXES = {"events.json.", "events.xml."};

    private final Path logDirectory;
    private final B2Service b2Service;

    public ArchiveService(
            @Value("${logging.event.path}") Path logDirectory,
            @Autowired(required = false) B2Service b2Service) {
        this.logDirectory = logDirectory;
        this.b2Service = b2Service;
    }

    @Async
    public void archiveOldLogs() {
        log.info("Starting archive of old log files");
        LocalDate threshold = LocalDate.now().minusDays(ARCHIVE_AFTER_DAYS);

        try (Stream<Path> files = Files.list(logDirectory)) {
            files.filter(Files::isRegularFile)
                 .filter(this::isRotatedLogFile)
                 .filter(path -> !path.toString().endsWith(".gz"))
                 .filter(path -> isOlderThan(path, threshold))
                 .forEach(this::compressFile);
        } catch (IOException e) {
            log.error("Failed to list log directory", e);
        }

        log.info("Archive completed");
    }

    @Async
    public void backupToB2() {
        if (b2Service == null) {
            log.warn("B2 service not configured, skipping backup");
            return;
        }

        log.info("Starting backup to B2");

        try (Stream<Path> files = Files.list(logDirectory)) {
            files.filter(Files::isRegularFile)
                 .filter(path -> path.toString().endsWith(".gz"))
                 .forEach(this::uploadToB2);
        } catch (IOException e) {
            log.error("Failed to list log directory for backup", e);
        }

        log.info("Backup to B2 completed");
    }

    private void uploadToB2(Path file) {
        String fileName = file.getFileName().toString();
        String remotePath = "logs/" + fileName;

        try {
            b2Service.uploadFile(file, remotePath);
            log.info("Uploaded to B2: {}", remotePath);
        } catch (Exception e) {
            log.error("Failed to upload to B2: {}", fileName, e);
        }
    }

    private boolean isRotatedLogFile(Path path) {
        String fileName = path.getFileName().toString();
        for (String prefix : LOG_PREFIXES) {
            if (fileName.startsWith(prefix)) {
                return true;
            }
        }
        return false;
    }

    private boolean isOlderThan(Path path, LocalDate threshold) {
        String fileName = path.getFileName().toString();

        for (String prefix : LOG_PREFIXES) {
            if (fileName.startsWith(prefix)) {
                String datePart = fileName.substring(prefix.length()).replace(".gz", "");
                try {
                    LocalDate fileDate = LocalDate.parse(datePart, DateTimeFormatter.ISO_LOCAL_DATE);
                    return fileDate.isBefore(threshold);
                } catch (DateTimeParseException e) {
                    return false;
                }
            }
        }
        return false;
    }

    private void compressFile(Path source) {
        Path target = Path.of(source.toString() + ".gz");

        if (Files.exists(target)) {
            log.debug("Archive already exists: {}", target);
            return;
        }

        log.info("Compressing: {}", source.getFileName());

        try (InputStream in = Files.newInputStream(source);
             OutputStream out = Files.newOutputStream(target);
             GZIPOutputStream gzip = new GZIPOutputStream(out)) {

            in.transferTo(gzip);
            gzip.finish();

            Files.delete(source);
            log.info("Archived: {} -> {}", source.getFileName(), target.getFileName());

        } catch (IOException e) {
            log.error("Failed to compress: {}", source, e);
            try {
                Files.deleteIfExists(target);
            } catch (IOException ignored) {}
        }
    }
}
