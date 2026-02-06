package bio.anode.phneutralizer.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.anode.modbus.ModbusIOService;
import com.ghgande.j2mod.modbus.ModbusException;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.RunningMode;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.exception.NeutralizerException;
import bio.anode.phneutralizer.model.MeasureEvent;
import bio.anode.phneutralizer.model.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;
import bio.anode.phneutralizer.service.NeutralizerService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Service
@Slf4j
public class NeutralizerServiceImpl implements NeutralizerService {

    // Neutralizer registers
    private static final int REG_COMMAND = 0;
    private static final int REG_RUNNING_MODE = 1;
    private static final int REG_STATUS = 2;
    private static final int REG_EMPTYING_TANK1 = 3;
    private static final int REG_EMPTYING_TANK2 = 4;
    private static final int REG_EMPTYING_NEUTRALIZER = 5;
    // 6-7-8 reserved
    private static final int REG_IDLE_TIME = 9;
    private static final int REG_NEUTRALIZATION_TIMEOUT = 10;
    private static final int REG_NEUTRALIZATION_PERIOD = 11;
    private static final int REG_FIRST_HOUR = 12;
    private static final int REG_ACID_PULSE_TIMING = 13;
    private static final int REG_ACID_PULSE_PERIOD = 14;
    private static final int REG_NEUTRALIZER_TANK_FULL = 15;
    private static final int REG_PH_TARGET = 16;
    private static final int REG_WASTE_TANK_FULL = 17;
    private static final int REG_RELAY_STATUS = 18;
    private static final int REG_WASTE_BIS_TANK_FULL = 19;
    private static final int REG_WASTE_SELECT = 40;

    // RTC registers
    private static final int REG_RTC_COMMAND = 20;
    private static final int REG_RTC_TIME_H = 21;
    private static final int REG_RTC_TIME_L = 22;
    private static final int REG_RTC_SET_TIME_H = 23;
    private static final int REG_RTC_SET_TIME_L = 24;

    // Thermometer registers
    private static final int REG_THERMO_COMMAND = 25;
    private static final int REG_TEMPERATURE = 26;

    // PH meter registers
    private static final int REG_PH_COMMAND = 27;
    private static final int REG_PH_MEASURE = 28;
    private static final int REG_ACID_LEVEL = 29;
    private static final int REG_PH_CALIBRATION = 30;

    // Commands for REG_COMMAND
    private static final int CMD_START_AUTO = 1;
    private static final int CMD_STOP_AUTO = 2;
    private static final int CMD_TRIGGER_NEUTRALIZATION = 3;
    private static final int CMD_EMPTY_TANK1 = 4;
    private static final int CMD_EMPTY_TANK2 = 5;
    private static final int CMD_EMPTY_NEUTRALIZER = 6;
    private static final int CMD_ACID_PUMP = 7;
    private static final int CMD_AGITATION = 8;

    // Commands for REG_PH_COMMAND
    private static final int CMD_PH_CALIBRATE_LOW = 1;
    private static final int CMD_PH_CALIBRATE_MID = 2;
    private static final int CMD_PH_CALIBRATE_HIGH = 3;

    // Commands for REG_RTC_COMMAND
    private static final int CMD_RTC_SYNC = 1;

    private final ModbusIOService modbusService;
    private final EventService eventService;
    private final String connectionName;
    private final int slaveId;

    public NeutralizerServiceImpl(
            ModbusIOService modbusService,
            EventService eventService,
            @Value("${neutralizer.connection-name}") String connectionName,
            @Value("${neutralizer.slave-id}") int slaveId) {
        this.modbusService = modbusService;
        this.eventService = eventService;
        this.connectionName = connectionName;
        this.slaveId = slaveId;
    }

    @Override
    public NeutralizerStatusResponse getStatus() {
        log.debug("Getting neutralizer status");
        try {
            double ph = readRegister(REG_PH_MEASURE) / 100.0;
            double temp = readRegister(REG_TEMPERATURE) / 100.0;
            Status status = Status.values()[readRegister(REG_STATUS)];
            RunningMode mode = RunningMode.values()[readRegister(REG_RUNNING_MODE)];

            // Log measure events
            eventService.archiveEvent(MeasureEvent.builder()
                    .timestamp(LocalDateTime.now())
                    .metricName("PH")
                    .value(ph)
                    .unit("pH")
                    .build());

            eventService.archiveEvent(MeasureEvent.builder()
                    .timestamp(LocalDateTime.now())
                    .metricName("TEMPERATURE")
                    .value(temp)
                    .unit("°C")
                    .build());

            return NeutralizerStatusResponse.builder()
                    .currentPh(ph)
                    .targetPh(readRegister(REG_PH_TARGET) / 100.0)
                    .temperature(temp)
                    .status(status)
                    .runningMode(mode)
                    .acidLevel(readRegister(REG_ACID_LEVEL) == 0 ? Level.OK : Level.LOW)
                    .neutralizerLevel(readRegister(REG_NEUTRALIZER_TANK_FULL) == 1 ? Level.FULL : Level.OK)
                    .wasteLevel(readRegister(REG_WASTE_TANK_FULL) == 1 ? Level.FULL : Level.OK)
                    .wasteBisLevel(readRegister(REG_WASTE_BIS_TANK_FULL) == 1 ? Level.FULL : Level.OK)
                    .systemTime(readDeviceTime())
                    .configuration(getConfiguration())
                    .build();
        } catch (ModbusException e) {
            log.error("Failed to get neutralizer status", e);
            throw new CommunicationException("Failed to communicate with neutralizer", e);
        }
    }

    @Override
    public NeutralizerConfiguration getConfiguration() {
        log.debug("Getting configuration");
        try {
            return NeutralizerConfiguration.builder()
                    .phTarget(readRegister(REG_PH_TARGET) / 100.0)
                    .wasteSelect(readRegister(REG_WASTE_SELECT))
                    .emptyingTank1(readRegister(REG_EMPTYING_TANK1))
                    .emptyingTank2(readRegister(REG_EMPTYING_TANK2))
                    .emptyingNeutralizer(readRegister(REG_EMPTYING_NEUTRALIZER))
                    .idleTimeBeforeNeutralization(readRegister(REG_IDLE_TIME))
                    .neutralizationTimeout(readRegister(REG_NEUTRALIZATION_TIMEOUT))
                    .neutralizationPeriod(readRegister(REG_NEUTRALIZATION_PERIOD))
                    .acidPulseTiming(readRegister(REG_ACID_PULSE_TIMING))
                    .acidPulsePeriod(readRegister(REG_ACID_PULSE_PERIOD))
                    .firstNeutralizationHour(readRegister(REG_FIRST_HOUR))
                    .build();
        } catch (ModbusException e) {
            log.error("Failed to get configuration", e);
            throw new CommunicationException("Failed to read configuration", e);
        }
    }

    @Override
    public void updateConfiguration(NeutralizerConfiguration config) {
        log.info("Updating configuration: {}", config);
        try {
            writeRegister(REG_PH_TARGET, (int) (config.getPhTarget() * 100));
            writeRegister(REG_WASTE_SELECT, config.getWasteSelect());
            writeRegister(REG_EMPTYING_TANK1, config.getEmptyingTank1());
            writeRegister(REG_EMPTYING_TANK2, config.getEmptyingTank2());
            writeRegister(REG_EMPTYING_NEUTRALIZER, config.getEmptyingNeutralizer());
            writeRegister(REG_IDLE_TIME, config.getIdleTimeBeforeNeutralization());
            writeRegister(REG_NEUTRALIZATION_TIMEOUT, config.getNeutralizationTimeout());
            writeRegister(REG_NEUTRALIZATION_PERIOD, config.getNeutralizationPeriod());
            writeRegister(REG_ACID_PULSE_TIMING, config.getAcidPulseTiming());
            writeRegister(REG_ACID_PULSE_PERIOD, config.getAcidPulsePeriod());
            writeRegister(REG_FIRST_HOUR, config.getFirstNeutralizationHour());
            log.info("Configuration updated successfully");
        } catch (ModbusException e) {
            log.error("Failed to update configuration", e);
            throw new CommunicationException("Failed to update configuration", e);
        }
    }

    @Override
    public void startAutomaticMode() {
        log.info("Starting automatic mode");
        try {
            writeRegister(REG_COMMAND, CMD_START_AUTO);
            logStatusEvent(Status.IDLE);
            log.info("Automatic mode started");
        } catch (ModbusException e) {
            log.error("Failed to start automatic mode", e);
            throw new NeutralizerException("Failed to start automatic mode", e);
        }
    }

    @Override
    public void stopAutomaticMode() {
        log.info("Stopping automatic mode");
        try {
            writeRegister(REG_COMMAND, CMD_STOP_AUTO);
            log.info("Switched to manual mode");
        } catch (ModbusException e) {
            log.error("Failed to stop automatic mode", e);
            throw new NeutralizerException("Failed to stop automatic mode", e);
        }
    }

    @Override
    public void triggerNeutralization() {
        log.info("Triggering neutralization");
        try {
            writeRegister(REG_COMMAND, CMD_TRIGGER_NEUTRALIZATION);
            logStatusEvent(Status.NEUTRALIZING);
            log.info("Neutralization triggered");
        } catch (ModbusException e) {
            log.error("Failed to trigger neutralization", e);
            throw new NeutralizerException("Failed to trigger neutralization", e);
        }
    }

    @Override
    public void emptyTank1(int duration) {
        log.info("Emptying tank 1 for {} seconds", duration);
        try {
            writeRegister(REG_EMPTYING_TANK1, duration);
            writeRegister(REG_COMMAND, CMD_EMPTY_TANK1);
            logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
            log.info("Tank 1 emptying started");
        } catch (ModbusException e) {
            log.error("Failed to empty tank 1", e);
            throw new NeutralizerException("Failed to empty tank 1", e);
        }
    }

    @Override
    public void emptyTank2(int duration) {
        log.info("Emptying tank 2 for {} seconds", duration);
        try {
            writeRegister(REG_EMPTYING_TANK2, duration);
            writeRegister(REG_COMMAND, CMD_EMPTY_TANK2);
            logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
            log.info("Tank 2 emptying started");
        } catch (ModbusException e) {
            log.error("Failed to empty tank 2", e);
            throw new NeutralizerException("Failed to empty tank 2", e);
        }
    }

    @Override
    public void emptyNeutralizer(int duration) {
        log.info("Emptying neutralizer for {} seconds", duration);
        try {
            writeRegister(REG_EMPTYING_NEUTRALIZER, duration);
            writeRegister(REG_COMMAND, CMD_EMPTY_NEUTRALIZER);
            logStatusEvent(Status.FORCING_EMPTYING_NEUTRALIZER);
            log.info("Neutralizer emptying started");
        } catch (ModbusException e) {
            log.error("Failed to empty neutralizer", e);
            throw new NeutralizerException("Failed to empty neutralizer", e);
        }
    }

    @Override
    public void activateAcidPump(int timing) {
        log.info("Activating acid pump for {} seconds", timing);
        try {
            writeRegister(REG_ACID_PULSE_TIMING, timing);
            writeRegister(REG_COMMAND, CMD_ACID_PUMP);
            logStatusEvent(Status.MANUALLY_PUMPING_ACID);
            log.info("Acid pump activated");
        } catch (ModbusException e) {
            log.error("Failed to activate acid pump", e);
            throw new NeutralizerException("Failed to activate acid pump", e);
        }
    }

    @Override
    public void activateAgitation(int period) {
        log.info("Activating agitation for {} seconds", period);
        try {
            writeRegister(REG_COMMAND, CMD_AGITATION);
            logStatusEvent(Status.MANUALLY_BULLING);
            log.info("Agitation activated");
        } catch (ModbusException e) {
            log.error("Failed to activate agitation", e);
            throw new NeutralizerException("Failed to activate agitation", e);
        }
    }

    @Override
    public void calibratePh(CalibrationRequest request) {
        log.info("Calibrating pH at {} point with value {}", request.getPoint(), request.getPhValue());
        try {
            // Set calibration value first
            writeRegister(REG_PH_CALIBRATION, (int) (request.getPhValue() * 100));

            // Send calibration command
            int cmd = switch (request.getPoint()) {
                case LOW -> CMD_PH_CALIBRATE_LOW;
                case MID -> CMD_PH_CALIBRATE_MID;
                case HIGH -> CMD_PH_CALIBRATE_HIGH;
            };
            writeRegister(REG_PH_COMMAND, cmd);
            log.info("pH calibration completed");
        } catch (ModbusException e) {
            log.error("Failed to calibrate pH", e);
            throw new NeutralizerException("Failed to calibrate pH", e);
        }
    }

    @Override
    public HardwareStatusResponse getHardwareStatus() {
        log.debug("Getting hardware status");
        try {
            return HardwareStatusResponse.builder()
                    .connected(true)
                    .portName(connectionName)
                    .baudrate(38400)
                    .slaveId(slaveId)
                    .relayStatus(readRegister(REG_RELAY_STATUS))
                    .deviceTime(readDeviceTime())
                    .firmwareVersion("1.0.0")
                    .build();
        } catch (ModbusException e) {
            log.error("Failed to get hardware status", e);
            throw new CommunicationException("Failed to get hardware status", e);
        }
    }

    @Override
    public void synchronizeTime() {
        log.info("Synchronizing device time");
        try {
            long epochSeconds = System.currentTimeMillis() / 1000;
            writeRegister(REG_RTC_SET_TIME_H, (int) (epochSeconds >> 16));
            writeRegister(REG_RTC_SET_TIME_L, (int) (epochSeconds & 0xFFFF));
            writeRegister(REG_RTC_COMMAND, CMD_RTC_SYNC);
            log.info("Device time synchronized");
        } catch (ModbusException e) {
            log.error("Failed to synchronize time", e);
            throw new CommunicationException("Failed to synchronize time", e);
        }
    }

    private LocalDateTime readDeviceTime() throws ModbusException {
        int high = readRegister(REG_RTC_TIME_H);
        int low = readRegister(REG_RTC_TIME_L);
        long epochSeconds = ((long) high << 16) | (low & 0xFFFF);
        return LocalDateTime.ofEpochSecond(epochSeconds, 0, java.time.ZoneOffset.UTC);
    }

    private int readRegister(int address) throws ModbusException {
        return (int) modbusService.readHoldingRegisters(connectionName, slaveId, address);
    }

    private void writeRegister(int address, int value) throws ModbusException {
        modbusService.writeHoldingRegisters(connectionName, slaveId, address, value);
    }

    private void logStatusEvent(Status status) {
        try {
            Level acidLevel = readRegister(REG_ACID_LEVEL) == 0 ? Level.OK : Level.LOW;
            eventService.archiveEvent(NeutralizerEvent.builder()
                    .timestamp(LocalDateTime.now())
                    .status(status)
                    .acidTankState(acidLevel)
                    .build());
        } catch (ModbusException e) {
            log.warn("Failed to read acid level for event logging", e);
            eventService.archiveEvent(NeutralizerEvent.builder()
                    .timestamp(LocalDateTime.now())
                    .status(status)
                    .build());
        }
    }
}
