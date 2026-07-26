package bio.anode.phneutralizer.config;

import javax.sql.DataSource;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.stereotype.Component;

@TestConfiguration
public class TestContainerConfig {

}

@Component
class TestDataInitializer {
    private final DataSource dataSource;
    private boolean initialized = false;

    public TestDataInitializer(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @EventListener(ContextRefreshedEvent.class)
    public void onContextRefreshed() {
        if (initialized) {
            return;
        }
        try {
            ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
            populator.addScript(new ClassPathResource("data.sql"));
            populator.setContinueOnError(false);
            populator.populate(dataSource.getConnection());
            initialized = true;
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize test data", e);
        }
    }
}
