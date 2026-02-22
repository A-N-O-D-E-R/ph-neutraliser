package bio.anode.phneutralizer.service;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.exception.NeutralizerException;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.model.event.NeutralizerEvent;
import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
@RequiredArgsConstructor
public class NeutralizerService  {

    // Using AtomicReference to ensure thread safety when updating these values from asynchronous events
    private final AtomicReference<Double> lastPhEvent = new AtomicReference<>();
    private final AtomicReference<Double> lastTempEvent = new AtomicReference<>();
    private final AtomicReference<Boolean> lastNeutralizerTankLevel = new AtomicReference<>(false);
    private final AtomicReference<Boolean> lastAcidTankLevel = new AtomicReference<>(false);
    private final AtomicReference<Boolean> lastWasteLevelEvent = new AtomicReference<>(false);
    private final AtomicReference<Boolean> lastWasteBisLevelEvent = new AtomicReference<>(false);

    // Injecting repositories and services
    private final PhNeutraliserUsage neutraliser;
    private final ClockRTCComponentUsage clock;
    private final RawValueReader reader;
    private final ValueWriter writer;
    private final EventService eventService;
    private final ArduinoModbusAutoCheckerService arduinoChecker;

    @PostConstruct
    public void initCommunication() {
        arduinoChecker.checkAndEnsureConnection(neutraliser);
    }

    @EventListener
    @Async
    public void handleMeasureEvent(MeasureEvent event) {
        switch (event.metricName()) {
            case "ph"                    -> lastPhEvent.set((Double) event.value());
            case "degree"                -> lastTempEvent.set((Double) event.value());
            case "neutralizer_tank_level"-> lastNeutralizerTankLevel.set((Boolean) event.value());
            case "waste_tank_level"      -> lastWasteLevelEvent.set((Boolean) event.value());
            case "waste_bis_tank_level"  -> lastWasteBisLevelEvent.set((Boolean) event.value());
            case "acid_tank_level"       -> lastAcidTankLevel.set((Boolean) event.value());
            case "cpu_use"               -> log.debug("Received CPU usage event: {}%", event.value());
            case "ram_use"               -> log.debug("Received RAM usage event: {}%", event.value());
            case "disk_use"              -> log.debug("Received Disk usage event: {}%", event.value());
            case "heap_used"             -> log.debug("Received Heap usage event: {}%", event.value());
            case "cpu_temperature"       -> log.debug("Received CPU temperature event: {}°C", event.value());
            case null, default           -> log.warn("Received MeasureEvent with unknown metric name: {}", event.metricName());
        }
    }

    
    public NeutralizerStatusResponse getStatus() {
        log.debug("Getting neutralizer status");
        try {
            NeutralizerConfiguration config = neutraliser.readConfiguration(reader);
            return NeutralizerStatusResponse.builder()
                    .currentPh(lastPhEvent.get())
                    .targetPh(config.getPhTarget())
                    .temperature(lastTempEvent.get())
                    .status(neutraliser.getStatus(reader))
                    .runningMode(neutraliser.getRunningMode(reader))
                    .acidLevel(lastAcidTankLevel.get() ? Level.OK : Level.LOW)
                    .neutralizerLevel(lastNeutralizerTankLevel.get() ? Level.HIGH : Level.OK)
                    .wasteLevel(lastWasteLevelEvent.get() ? Level.HIGH : Level.OK)
                    .wasteBisLevel(lastWasteBisLevelEvent.get() ? Level.HIGH : Level.OK)
                    .systemTime(clock.read(reader))
                    .configuration(config)
                    .build();
        } catch (Exception e) {
            log.error("Failed to get neutralizer status", e);
            throw new CommunicationException("Failed to communicate with neutralizer", e);
        }
    }

    
    public NeutralizerConfiguration getConfiguration() {
        log.debug("Getting configuration");
        try {
            return neutraliser.readConfiguration(reader);
        } catch (CommunicationException e) {
            log.error("Failed to get configuration", e);
            throw new CommunicationException("Failed to read configuration", e);
        }
    }

    
    public void updateConfiguration(NeutralizerConfiguration config) {
        log.info("Updating configuration: {}", config);
        try {
            neutraliser.writeConfiguration(config, writer);
            log.info("Configuration updated successfully");
        } catch (CommunicationException e) {
            log.error("Failed to update configuration", e);
            throw new CommunicationException("Failed to update configuration", e);
        }
    }

    
    public void startAutomaticMode() {
        log.info("Starting automatic mode");
        try {
            neutraliser.startAutomatic(writer);
            logStatusEvent(Status.IDLE);
            log.info("Automatic mode started");
        } catch (CommunicationException e) {
            log.error("Failed to start automatic mode", e);
            throw new NeutralizerException("Failed to start automatic mode", e);
        }
    }

    
    public void stopAutomaticMode() {
        log.info("Stopping automatic mode");
        try {
            neutraliser.stopAutomatic(writer);
            log.info("Switched to manual mode");
        } catch (CommunicationException e) {
            log.error("Failed to stop automatic mode", e);
            throw new NeutralizerException("Failed to stop automatic mode", e);
        }
    }

    
    public void triggerNeutralization() {
        log.info("Triggering neutralization");
        try {
            neutraliser.triggerNeutralization(writer);
            logStatusEvent(Status.NEUTRALIZING);
            log.info("Neutralization triggered");
        } catch (CommunicationException e) {
            log.error("Failed to trigger neutralization", e);
            throw new NeutralizerException("Failed to trigger neutralization", e);
        }
    }

    
    public void emptyTank1(int duration) {
        log.info("Emptying tank 1 for {} seconds", duration);
        try {
            neutraliser.emptyTank1(duration, writer);
            logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
            log.info("Tank 1 emptying started");
        } catch (CommunicationException e) {
            log.error("Failed to empty tank 1", e);
            throw new NeutralizerException("Failed to empty tank 1", e);
        }
    }

    
    public void emptyTank2(int duration) {
        log.info("Emptying tank 2 for {} seconds", duration);
        try {
            neutraliser.emptyTank2(duration, writer);
            logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
            log.info("Tank 2 emptying started");
        } catch (CommunicationException e) {
            log.error("Failed to empty tank 2", e);
            throw new NeutralizerException("Failed to empty tank 2", e);
        }
    }

    
    public void emptyNeutralizer(int duration) {
        log.info("Emptying neutralizer for {} seconds", duration);
        try {
            neutraliser.emptyNeutralizer(duration, writer);
            logStatusEvent(Status.FORCING_EMPTYING_NEUTRALIZER);
            log.info("Neutralizer emptying started");
        } catch (CommunicationException e) {
            log.error("Failed to empty neutralizer", e);
            throw new NeutralizerException("Failed to empty neutralizer", e);
        }
    }

    
    public void activateAcidPump(int timing) {
        log.info("Activating acid pump for {} seconds", timing);
        try {
            neutraliser.activateAcidPump(timing, writer);
            logStatusEvent(Status.MANUALLY_PUMPING_ACID);
            log.info("Acid pump activated");
        } catch (CommunicationException e) {
            log.error("Failed to activate acid pump", e);
            throw new NeutralizerException("Failed to activate acid pump", e);
        }
    }

    
    public void activateAgitation(int period) {
        log.info("Activating agitation for {} seconds", period);
        try {
            neutraliser.activateAgitation(writer);
            logStatusEvent(Status.MANUALLY_BULLING);
            log.info("Agitation activated");
        } catch (CommunicationException e) {
            log.error("Failed to activate agitation", e);
            throw new NeutralizerException("Failed to activate agitation", e);
        }
    }

    
    public void calibratePh(CalibrationRequest request) {
        log.info("Calibrating pH at {} point with value {}", request.getPoint(), request.getPhValue());
        try {
            neutraliser.calibratePh(request, writer);
            log.info("pH calibration completed");
        } catch (CommunicationException e) {
            log.error("Failed to calibrate pH", e);
            throw new NeutralizerException("Failed to calibrate pH", e);
        }
    }

    
    public HardwareStatusResponse getHardwareStatus() {
        log.debug("Getting hardware status");
        try {
            ModbusConnectionParameters baseParams = (ModbusConnectionParameters) neutraliser.getNeutralizer().getConnectionParameters();
            return HardwareStatusResponse.builder()
                    .connected(true) // add a var in NeutralizerServiceImpl to track connection status and return it here by checking the last successful communication time with the device
                    .portName(baseParams.getName())
                    .baudrate(38400) // TODO: read actual baudrate from device and return it here
                    .slaveId(baseParams.getSlaveId())
                    .relayStatus(neutraliser.getRelayStatus(reader))
                    .deviceTime(clock.read(reader))
                    .firmwareVersion("1.0.0") // TODO: read actual firmware version from device and return it here
                    .build();
        } catch (Exception e) {
            log.error("Failed to get hardware status", e);
            throw new CommunicationException("Failed to get hardware status", e);
        }
    }

    
    public void synchronizeTime() {
        log.info("Synchronizing device time");
        try {
            clock.write(writer, LocalDateTime.now());
            log.info("Device time synchronized");
        } catch (Exception e) {
            log.error("Failed to synchronize time", e);
            throw new CommunicationException("Failed to synchronize time", e);
        }
    }

    private void logStatusEvent(Status status) {
        try {
            Level acidLevel = neutraliser.getAcidLevel(reader) == 0 ? Level.OK : Level.LOW;
            eventService.archiveEvent(new NeutralizerEvent(LocalDateTime.now(), status, acidLevel));
        } catch (CommunicationException e) {
            log.warn("Failed to read acid level for event logging", e);
            eventService.archiveEvent(new NeutralizerEvent(LocalDateTime.now(), status, null));
        }
    }
}
