package bio.anode.phneutralizer.service.writer;

import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import lombok.extern.slf4j.Slf4j;

@Service
@Profile({"test", "local"})
@Slf4j
public class MockValueWriter implements ValueWriter {

    private final Map<UUID, Object> store = new ConcurrentHashMap<>();

    @Override
    public void write(Object value, ConnectionParameters parameters) throws CommunicationException {
        log.debug("Mock write: value={} id={} type={}", value, parameters.getId(), parameters.getClass().getSimpleName());
        store.put(parameters.getId(), value);
    }

    public Optional<Object> getStoredValue(UUID id) {
        if (id == null) {
            return Optional.empty(); // No logging here to avoid cluttering logs with null IDs
        }
        return Optional.ofNullable(store.get(id));
    }
}
