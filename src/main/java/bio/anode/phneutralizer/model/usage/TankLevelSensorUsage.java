package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@DiscriminatorValue("TANKLEVEL")
@NoArgsConstructor
@ToString(callSuper = true)
public class TankLevelSensorUsage extends SensorUsage<Boolean> {
    
    public TankLevelSensorUsage(Sensor sensor, String metricName) {
        if (sensor.getType() != Sensor.Type.TANKLEVEL) {
            throw new IllegalArgumentException("Sensor must be of type TANKLEVEL");
        }
        setComponent(sensor);
        setId(java.util.UUID.randomUUID());
        setInstalled(true);
        setMetricName(metricName);
    }

    @Override
    public Boolean getMesure(RawValueReader reader) {
        try {
            Object rawValue = reader.read(getSensor().getConnectionParameters());
            return ((int)rawValue == 1);
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
