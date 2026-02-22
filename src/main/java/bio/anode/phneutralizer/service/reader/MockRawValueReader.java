package bio.anode.phneutralizer.service.reader;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.connection.SystemConnectionParameters;
import bio.anode.phneutralizer.service.writer.MockValueWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Profile({"test", "local"})
@Service
@Slf4j
@RequiredArgsConstructor
public class MockRawValueReader implements RawValueReader {
    private final MockValueWriter mockValueWriter;

    @Override
    public Object read(ConnectionParameters parameters) throws Exception {
        if(parameters.getId() == null) {
            log.warn("Attempting to read with null ID for parameters: {}", parameters.toString());
            return defaultValue(parameters);
        }
        return mockValueWriter.getStoredValue(parameters.getId())
                .orElseGet(() -> defaultValue(parameters));
    }

    private Object defaultValue(ConnectionParameters parameters) {
        return switch (parameters) {
            case ModbusConnectionParameters modbus -> {
                log.debug("Mock read default for Modbus id={} name={}", modbus.getId(), modbus.getName());
                yield 700.0;
            }
            case SystemConnectionParameters system -> {
                log.debug("Mock read default for System id={} metric={}", system.getId(), system.getMetricName());
                yield 0.0;
            }
            default -> {
                log.warn("Mock read unknown connection type: {}", parameters.getClass().getSimpleName());
                yield 1.0;
            }
        };
    }
}
