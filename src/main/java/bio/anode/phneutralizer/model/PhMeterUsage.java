package bio.anode.phneutralizer.model;

import bio.anode.phneutralizer.model.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@DiscriminatorValue("PHMETER")
@NoArgsConstructor
@ToString(callSuper = true)
public class PhMeterUsage extends SensorUsage {

    public PhMeterUsage(Sensor sensor, ConnectionParameters connection, String metricName) {
        if (sensor.getType() != Sensor.Type.PHMETER) {
            throw new IllegalArgumentException("Sensor must be of type PHMETER");
        }
        setId(java.util.UUID.randomUUID());
        setSensor(sensor);
        setInstalled(true);
        setMetricName(metricName);
        setConnectionParameters(connection);
    }

    @Override
    public double getMesure(RawValueReader reader) {
        try {
            Object rawValue = reader.read(getConnectionParameters());
            return ((Double) rawValue) / 100.0;
        } catch (Exception e) {
            e.printStackTrace();
            return Double.NaN;
        }
    }
}
