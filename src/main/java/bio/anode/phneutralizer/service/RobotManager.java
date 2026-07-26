package bio.anode.phneutralizer.service;

import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.repository.ClockRTCRepository;
import bio.anode.phneutralizer.repository.PhNeutraliserRepository;
import org.springframework.stereotype.Service;


@Service
public class RobotManager {

    private final PhNeutraliserRepository neutraliserRepository;
    private final ClockRTCRepository clockRepository;

    private PhNeutraliserUsage neutraliser;
    private ClockRTCComponentUsage clock;
    private boolean initialized = false;

    public RobotManager(PhNeutraliserRepository neutraliserRepository,
                        ClockRTCRepository clockRepository) {
        this.neutraliserRepository = neutraliserRepository;
        this.clockRepository = clockRepository;
    }

    private void ensureInitialized() {
        if (!initialized) {
            this.neutraliser = neutraliserRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No PhNeutraliserUsage found"));

            this.clock = clockRepository.findAll().stream()
                    .findFirst()
                    .orElseThrow(() -> new IllegalStateException("No ClockRTCComponentUsage found"));
            initialized = true;
        }
    }

    public PhNeutraliserUsage getNeutraliser() {
        ensureInitialized();
        return neutraliser;
    }

    public ClockRTCComponentUsage getClock() {
        ensureInitialized();
        return clock;
    }
}
