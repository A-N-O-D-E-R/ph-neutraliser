package bio.anode.phneutralizer.model.connection;

import java.time.Duration;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "connection_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class ConnectionParameters {
    @Id
    @GeneratedValue
    private UUID id;
    
    private long updateFrequencySeconds;


    private boolean managed;

    public Duration getUpdateFrequency() {
        return Duration.ofSeconds(updateFrequencySeconds);
    }

    public void setUpdateFrequency(Duration duration) {
        this.updateFrequencySeconds = duration.getSeconds();
    }
}
