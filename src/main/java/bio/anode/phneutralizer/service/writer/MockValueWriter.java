package bio.anode.phneutralizer.service.writer;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.connection.SystemConnectionParameters;
import lombok.extern.slf4j.Slf4j;

@Service
@Profile({"test", "local"})
@Slf4j
public class MockValueWriter implements ValueWriter {

    private final Map<String, Object> store = new ConcurrentHashMap<>();

    @Override
    public void write(Object value, ConnectionParameters parameters) throws CommunicationException {
        log.debug("Mock write: value={} id={} type={}", value, parameters.getId(), parameters.getClass().getSimpleName());
        if(parameters instanceof ModbusConnectionParameters modbus) {
            store.put(parameters.getId()+"_"+modbus.getName()+"_"+modbus.getSlaveId()+"_"+modbus.getOffset(), value);
        } else if (parameters instanceof SystemConnectionParameters system) {
            store.put(parameters.getId()+"_"+system.getPoolName()+"_"+system.getMetricName(), value);
        }else{
            store.put(parameters.getId().toString(), value);
        }
    }

    public Optional<Object> getStoredValue(String key) {
        if (key == null) {
            return Optional.empty(); // No logging here to avoid cluttering logs with null keys
        }
        return Optional.ofNullable(store.get(key));
    }
}
