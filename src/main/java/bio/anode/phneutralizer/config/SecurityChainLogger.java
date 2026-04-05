package bio.anode.phneutralizer.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationListener;
import org.springframework.stereotype.Component;

import lombok.extern.slf4j.Slf4j;

import org.springframework.security.web.SecurityFilterChain;

@Slf4j
@Component
public class SecurityChainLogger implements ApplicationListener<ApplicationReadyEvent> {

    @Autowired
    private List<SecurityFilterChain> filterChains;

    @Override
    public void onApplicationEvent(ApplicationReadyEvent event) {
        filterChains.forEach(chain -> {
            log.info("SecurityFilterChain: {} [{}]", 
                chain.getClass().getSimpleName(),
                chain); // prints the bean source if DefaultSecurityFilterChain
        });
    }
}