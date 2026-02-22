package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.component.regulator.Regulator;
import bio.anode.phneutralizer.model.component.sensor.Sensor;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public abstract class RegulatorUsage extends NetworkingComponantUsage {
    
    public abstract void setThreshold(double consigne, ValueWriter writer) throws CommunicationException;
	public abstract double getThreshold(RawValueReader reader) throws CommunicationException;
    
    private Sensor regulatedSensor;
    
    public Regulator getRegulator(){
        return ((Regulator)getComponent());
    }

}
