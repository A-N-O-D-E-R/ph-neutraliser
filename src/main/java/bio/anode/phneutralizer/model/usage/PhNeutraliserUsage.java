package bio.anode.phneutralizer.model.usage;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.enums.CalibrationPoint;
import bio.anode.phneutralizer.enums.RunningMode;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.model.component.actuator.NeutralizerActuatorComponent;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;

public class PhNeutraliserUsage extends ActuatorUsage {

    // Commands for REG_COMMAND
    private static final int CMD_START_AUTO              = 1;
    private static final int CMD_STOP_AUTO              = 2;
    private static final int CMD_TRIGGER_NEUTRALIZATION = 3;
    private static final int CMD_EMPTY_TANK1            = 4;
    private static final int CMD_EMPTY_TANK2            = 5;
    private static final int CMD_EMPTY_NEUTRALIZER      = 6;
    private static final int CMD_ACID_PUMP              = 7;
    private static final int CMD_AGITATION               = 8;
    // Commands for REG_PH_COMMAND
    private static final int CMD_PH_CALIBRATE_LOW        = 1;
    private static final int CMD_PH_CALIBRATE_MID        = 2;
    private static final int CMD_PH_CALIBRATE_HIGH       = 3;

    public NeutralizerActuatorComponent getNeutralizer() {
        return (NeutralizerActuatorComponent) getComponent();
    }

    // --- Status reads ---

    public Status getStatus(RawValueReader reader) throws CommunicationException {
        try {
            int raw = ((Number) reader.read(getNeutralizer().getStatusConnectionParameters())).intValue();
            return Status.fromValue(raw);
        } catch (Exception e) {
            throw new CommunicationException("Failed to read neutralizer status", e);
        }
    }

    public RunningMode getRunningMode(RawValueReader reader) throws CommunicationException {
        try {
            int raw = ((Number) reader.read(getNeutralizer().getRunningModeConnectionParameters())).intValue();
            return RunningMode.fromValue(raw);
        } catch (Exception e) {
            throw new CommunicationException("Failed to read running mode", e);
        }
    }

    public int getRelayStatus(RawValueReader reader) throws CommunicationException {
        try {
            return ((Number) reader.read(getNeutralizer().getRelayStatusConnectionParameters())).intValue();
        } catch (Exception e) {
            throw new CommunicationException("Failed to read relay status", e);
        }
    }

    public int getAcidLevel(RawValueReader reader) throws CommunicationException {
        try {
            return ((Number) reader.read(getNeutralizer().getAcidLevelConnectionParameters())).intValue();
        } catch (Exception e) {
            throw new CommunicationException("Failed to read acid level", e);
        }
    }

    // --- Commands ---

    public void startAutomatic(ValueWriter writer) throws CommunicationException {
        writer.write(CMD_START_AUTO, getNeutralizer().getCommandConnectionParameters());
    }

    public void stopAutomatic(ValueWriter writer) throws CommunicationException {
        writer.write(CMD_STOP_AUTO, getNeutralizer().getCommandConnectionParameters());
    }

    public void triggerNeutralization(ValueWriter writer) throws CommunicationException {
        writer.write(CMD_TRIGGER_NEUTRALIZATION, getNeutralizer().getCommandConnectionParameters());
    }

    public void emptyTank1(int duration, ValueWriter writer) throws CommunicationException {
        writer.write(duration, getNeutralizer().getEmptyingTank1ConnectionParameters());
        writer.write(CMD_EMPTY_TANK1, getNeutralizer().getCommandConnectionParameters());
    }

    public void emptyTank2(int duration, ValueWriter writer) throws CommunicationException {
        writer.write(duration, getNeutralizer().getEmptyingTank2ConnectionParameters());
        writer.write(CMD_EMPTY_TANK2, getNeutralizer().getCommandConnectionParameters());
    }

    public void emptyNeutralizer(int duration, ValueWriter writer) throws CommunicationException {
        writer.write(duration, getNeutralizer().getEmptyingNeutralizerConnectionParameters());
        writer.write(CMD_EMPTY_NEUTRALIZER, getNeutralizer().getCommandConnectionParameters());
    }

    public void activateAcidPump(int timing, ValueWriter writer) throws CommunicationException {
        writer.write(timing, getNeutralizer().getAcidPulseTimingConnectionParameters());
        writer.write(CMD_ACID_PUMP, getNeutralizer().getCommandConnectionParameters());
    }

    public void activateAgitation(ValueWriter writer) throws CommunicationException {
        writer.write(CMD_AGITATION, getNeutralizer().getCommandConnectionParameters());
    }

    // --- Configuration ---

    public NeutralizerConfiguration readConfiguration(RawValueReader reader) throws CommunicationException {
        try {
            NeutralizerActuatorComponent n = getNeutralizer();
            return NeutralizerConfiguration.builder()
                    .phTarget(((Number) reader.read(n.getPhTargetConnectionParameters())).intValue() / 100.0)
                    .wasteSelect(((Number) reader.read(n.getWasteSelectConnectionParameters())).intValue())
                    .emptyingTank1(((Number) reader.read(n.getEmptyingTank1ConnectionParameters())).intValue())
                    .emptyingTank2(((Number) reader.read(n.getEmptyingTank2ConnectionParameters())).intValue())
                    .emptyingNeutralizer(((Number) reader.read(n.getEmptyingNeutralizerConnectionParameters())).intValue())
                    .idleTimeBeforeNeutralization(((Number) reader.read(n.getIdleTimeConnectionParameters())).intValue())
                    .neutralizationTimeout(((Number) reader.read(n.getNeutralizationTimeoutConnectionParameters())).intValue())
                    .neutralizationPeriod(((Number) reader.read(n.getNeutralizationPeriodConnectionParameters())).intValue())
                    .acidPulseTiming(((Number) reader.read(n.getAcidPulseTimingConnectionParameters())).intValue())
                    .acidPulsePeriod(((Number) reader.read(n.getAcidPulsePeriodConnectionParameters())).intValue())
                    .firstNeutralizationHour(((Number) reader.read(n.getFirstHourConnectionParameters())).intValue())
                    .build();
        } catch (Exception e) {
            throw new CommunicationException("Failed to read configuration", e);
        }
    }

    public void calibratePh(CalibrationRequest request, ValueWriter writer) throws CommunicationException {
        writer.write((int) (request.getPhValue() * 100), getNeutralizer().getPhCalibrationConnectionParameters());
        int cmd = switch (request.getPoint()) {
            case LOW  -> CMD_PH_CALIBRATE_LOW;
            case MID  -> CMD_PH_CALIBRATE_MID;
            case HIGH -> CMD_PH_CALIBRATE_HIGH;
        };
        writer.write(cmd, getNeutralizer().getPhCommandConnectionParameters());
    }

    public void writeConfiguration(NeutralizerConfiguration config, ValueWriter writer) throws CommunicationException {
        NeutralizerActuatorComponent n = getNeutralizer();
        writer.write((int) (config.getPhTarget() * 100),         n.getPhTargetConnectionParameters());
        writer.write(config.getWasteSelect(),                    n.getWasteSelectConnectionParameters());
        writer.write(config.getEmptyingTank1(),                  n.getEmptyingTank1ConnectionParameters());
        writer.write(config.getEmptyingTank2(),                  n.getEmptyingTank2ConnectionParameters());
        writer.write(config.getEmptyingNeutralizer(),            n.getEmptyingNeutralizerConnectionParameters());
        writer.write(config.getIdleTimeBeforeNeutralization(),   n.getIdleTimeConnectionParameters());
        writer.write(config.getNeutralizationTimeout(),          n.getNeutralizationTimeoutConnectionParameters());
        writer.write(config.getNeutralizationPeriod(),           n.getNeutralizationPeriodConnectionParameters());
        writer.write(config.getAcidPulseTiming(),                n.getAcidPulseTimingConnectionParameters());
        writer.write(config.getAcidPulsePeriod(),                n.getAcidPulsePeriodConnectionParameters());
        writer.write(config.getFirstNeutralizationHour(),        n.getFirstHourConnectionParameters());
    }
}
