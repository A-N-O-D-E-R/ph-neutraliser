package bio.anode.phneutralizer.model.usage;

import java.time.Duration;

import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
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
public abstract class SensorUsage extends NetworkingComponantUsage {

    private boolean installed;

    private String metricName;

    public abstract double getMesure(RawValueReader reader);

    public double getSensibilite() {
        Double s = ((Sensor) getComponent()).getSensibility();
        return s != null ? s : 0.0;
    }

    public Duration getUpdateFrequency() {
        return ((Sensor) getComponent()).getConnectionParameters().getUpdateFrequency();
    }

    public String getUnit() {
        String u = ((Sensor) getComponent()).getUnit();
        return u != null ? u : "";
    }

    public Sensor getSensor() {
        return (Sensor) getComponent();
    }

    public String getName() {
        return  getComponent().getModel().getName() + " " + getComponent().getSerialNumber();
    }
}
