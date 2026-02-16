package bio.anode.phneutralizer.model.connection;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("SYSTEM")
public class SystemConnectionParameters extends ConnectionParameters {
    private String poolName;
    private String metricName;
}
