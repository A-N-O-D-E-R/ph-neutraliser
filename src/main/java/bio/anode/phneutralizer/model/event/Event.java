package bio.anode.phneutralizer.model.event;
import java.time.LocalDateTime;

public interface Event extends Comparable<Event> {
    LocalDateTime timestamp();
    @Override
    default int compareTo(Event other) {
        return timestamp().compareTo(other.timestamp());
    }
}