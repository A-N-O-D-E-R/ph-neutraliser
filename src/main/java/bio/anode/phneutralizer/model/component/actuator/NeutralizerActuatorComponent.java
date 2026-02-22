package bio.anode.phneutralizer.model.component.actuator;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

@Entity
@DiscriminatorValue("NEUTRALIZER_ACTUATOR")
@NoArgsConstructor
/**
 * So far, this class is only used for the specific arduino neutralizer, 
 * I do not really like it, but it is what it is for now. It could be refactored 
 * in the future to be more generic and reusable if we end up with more than 
 * one type of neutralizer.
 * 
 * To do so, we would need to abstract the specific commands and parameters of the arduino neutralizer,
 * and make them more generic, so that we can have different implementations for different types of neutralizers.
 * 
 *  We would also need to abstract the configuration reading and writing, as it is currently very specific
 */
public class NeutralizerActuatorComponent extends Actuator {

    // All offsets are relative to connectionParameters.offset (= REG_COMMAND = 0)
    // --- Control & status ---
    public ConnectionParameters getCommandConnectionParameters()              { return atOffset(0);  }
    public ConnectionParameters getRunningModeConnectionParameters()          { return atOffset(1);  }
    public ConnectionParameters getStatusConnectionParameters()               { return atOffset(2);  }
    // --- Tank operation durations ---
    public ConnectionParameters getEmptyingTank1ConnectionParameters()        { return atOffset(3);  }
    public ConnectionParameters getEmptyingTank2ConnectionParameters()        { return atOffset(4);  }
    public ConnectionParameters getEmptyingNeutralizerConnectionParameters()  { return atOffset(5);  }
    // --- Timing configuration ---
    public ConnectionParameters getIdleTimeConnectionParameters()             { return atOffset(9);  }
    public ConnectionParameters getNeutralizationTimeoutConnectionParameters(){ return atOffset(10); }
    public ConnectionParameters getNeutralizationPeriodConnectionParameters() { return atOffset(11); }
    public ConnectionParameters getFirstHourConnectionParameters()            { return atOffset(12); }
    public ConnectionParameters getAcidPulseTimingConnectionParameters()      { return atOffset(13); }
    public ConnectionParameters getAcidPulsePeriodConnectionParameters()      { return atOffset(14); }
    // --- Thresholds & targets ---
    public ConnectionParameters getPhTargetConnectionParameters()             { return atOffset(16); }
    // --- Hardware status ---
    public ConnectionParameters getRelayStatusConnectionParameters()          { return atOffset(18); }
    // --- Acid level (pH module, same device) ---
    public ConnectionParameters getAcidLevelConnectionParameters()            { return atOffset(29); }
    // --- pH meter sub-module (same device) ---
    public ConnectionParameters getPhCommandConnectionParameters()            { return atOffset(27); }
    public ConnectionParameters getPhCalibrationConnectionParameters()        { return atOffset(30); }
    // --- Non-sequential register ---
    public ConnectionParameters getWasteSelectConnectionParameters()          { return atOffset(40); }

    private ModbusConnectionParameters atOffset(int delta) {
        ModbusConnectionParameters base = (ModbusConnectionParameters) getConnectionParameters();
        return new ModbusConnectionParameters(base.getName(), base.getSlaveId(), base.getOffset() + delta);
    }
}
