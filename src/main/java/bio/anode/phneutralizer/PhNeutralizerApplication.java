package bio.anode.phneutralizer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

import com.anode.autoconfiguration.security.properties.AnodeSecurityProperties;

@SpringBootApplication
@EnableScheduling
@EnableAsync
public class PhNeutralizerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PhNeutralizerApplication.class, args);
    }
}
