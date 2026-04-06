package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("MEMORYMETER")
@NoArgsConstructor
public class MemorymeterUsage extends SensorUsage<Double> {

    public MemorymeterUsage(Sensor sensor, String metricName) {
        if (sensor.getSensorType() != Sensor.Type.MEMORYMETER) {
            throw new IllegalArgumentException("Sensor must be of type MEMORYMETER");
        }
        setComponent(sensor);
        setId(java.util.UUID.randomUUID());
        setInstalled(true);
        setMetricName(metricName);
    }

    @Override
    public Double getMesure(RawValueReader reader) {
        try {
            Object rawValue = reader.read(getSensor().getConnectionParameters());
            return ((Double) rawValue) / 1024.0;
        } catch (Exception e) {
            e.printStackTrace();
            return Double.NaN;
        }
    }


}
