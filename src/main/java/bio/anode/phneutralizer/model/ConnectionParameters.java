package bio.anode.phneutralizer.model;

import java.time.Duration;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ConnectionParameters {

    private String name;

    private int slaveId;

    private int offset;

    private long updateFrequencySeconds;

    private boolean managed;

    public Duration getUpdateFrequency() {
        return Duration.ofSeconds(updateFrequencySeconds);
    }

    public void setUpdateFrequency(Duration duration) {
        this.updateFrequencySeconds = duration.getSeconds();
    }
}
