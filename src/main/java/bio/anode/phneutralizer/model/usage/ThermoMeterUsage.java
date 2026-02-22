package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@DiscriminatorValue("THERMOMETER")
@NoArgsConstructor
@ToString(callSuper = true)
public class ThermoMeterUsage extends SensorUsage<Double> {

    public ThermoMeterUsage(Sensor sensor, String metricName) {
        if (sensor.getType() != Sensor.Type.THERMOMETER) {
            throw new IllegalArgumentException("Sensor must be of type THERMOMETER");
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
            return ((Double) rawValue) / 100.0;
        } catch (Exception e) {
            e.printStackTrace();
            return Double.NaN;
        }
    }
}
