package bio.anode.phneutralizer.config;

import org.springframework.context.annotation.Bean;

import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.repository.ClockRTCRepository;
import bio.anode.phneutralizer.repository.PhNeutraliserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;

import com.esotericsoftware.kryo.util.ObjectMap;
import com.fasterxml.jackson.databind.ObjectMapper;

@Configuration
@RequiredArgsConstructor
public class NeutraliserInitConfig {
    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper();
    }
}
