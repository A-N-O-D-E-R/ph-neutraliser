package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.component.regulator.Regulator;
import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;

public class PhRegulatorUsage extends RegulatorUsage {


    public PhRegulatorUsage(Regulator regulator, Sensor sensor, String metricName) {
        if (sensor.getType() != Sensor.Type.PHMETER) {
            throw new IllegalArgumentException("regulator must regulate a sensor of type PHMETER");
        }
        setRegulatedSensor(sensor);
        setId(java.util.UUID.randomUUID());
        setComponent(regulator);
    }

    @Override
    public void setThreshold(double consigne, ValueWriter writer) throws CommunicationException {
        writer.write((int) (consigne * 100), getRegulator().getConnectionParameters());
    }

    @Override
    public double getThreshold(RawValueReader reader) throws CommunicationException {
        try {
            Object rawValue = reader.read(getRegulator().getConnectionParameters());
            return ((Double) rawValue) / 100.0;
        } catch (Exception e) {
            e.printStackTrace();
            return Double.NaN;
        }
    }
    
}
