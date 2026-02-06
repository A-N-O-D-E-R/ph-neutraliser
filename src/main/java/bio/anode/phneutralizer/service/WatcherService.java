package bio.anode.phneutralizer.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class WatcherService {

    private final NeutralizerService neutralizerService;
    private final ArchiveService archiveService;

    @Scheduled(fixedRateString = "${scheduler.watcher.status-rate}")
    public void watchStatus() {
        try {
            neutralizerService.getStatus();
            log.debug("Status polled successfully");
        } catch (Exception e) {
            log.error("Failed to poll status", e);
        }
    }

    @Scheduled(cron = "${scheduler.archive.cron}")
    public void archiveOldLogs() {
        archiveService.archiveOldLogs();
    }

    @Scheduled(cron = "${scheduler.backup.cron}")
    public void backupToB2() {
        archiveService.backupToB2();
    }
}
