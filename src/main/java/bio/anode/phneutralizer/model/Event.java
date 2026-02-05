package bio.anode.phneutralizer.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class Event implements Comparable<Event> {
    private LocalDateTime timestamp;

    @Override
    public int compareTo(Event other) {
        return this.timestamp.compareTo(other.timestamp);
    }
}
