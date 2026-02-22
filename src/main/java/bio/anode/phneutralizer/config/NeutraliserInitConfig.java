package bio.anode.phneutralizer.config;

import org.springframework.context.annotation.Bean;

import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.repository.ClockRTCRepository;
import bio.anode.phneutralizer.repository.PhNeutraliserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

@Configuration
@RequiredArgsConstructor
public class NeutraliserInitConfig {

    private final PhNeutraliserRepository neutraliserRepository;
    private final ClockRTCRepository clockRepository;

    @Bean(name = "neutraliserUsage")
    public PhNeutraliserUsage neutraliserUsage() {
        return neutraliserRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No PhNeutraliserUsage found in database"));
    }

    @Bean(name = "clockUsage")
    public ClockRTCComponentUsage clockUsage() {
        return clockRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No ClockRTCComponentUsage found in database"));
    }
}
