package bio.anode.phneutralizer;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.junit.jupiter.Testcontainers;
import bio.anode.phneutralizer.config.TestContainerConfig;

@SpringBootTest(properties = {
    "spring.autoconfigure.exclude=com.anode.autoconfiguration.modbus.ModbusAutoConfiguration"
})
@ActiveProfiles("test")
@Testcontainers
@Import(TestContainerConfig.class)
class PhNeutralizerApplicationTests {

	@Test
	void contextLoads() {
	}
}
