package bio.anode.phneutralizer.model;

import java.time.Duration;
import java.util.UUID;

import bio.anode.phneutralizer.model.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "usage_type")
@Getter
@Setter
@NoArgsConstructor
@ToString  
public abstract class SensorUsage {

    @Id
    private UUID id;

    @ManyToOne
    private Sensor sensor;

    private boolean installed;

    @Embedded
    private ConnectionParameters connectionParameters;

    private String metricName;

    public abstract double getMesure(RawValueReader reader);

    public double getSensibilite() {
        Double s = sensor.getSensibility();
        return s != null ? s : 0.0;
    }

    public Duration getUpdateFrequency() {
        return connectionParameters.getUpdateFrequency();
    }

    public String getUnit() {
        String u = sensor.getUnit();
        return u != null ? u : "";
    }

    public String getName() {
        return sensor.getModel().getName() + " " + sensor.getSerialNumber();
    }
}
