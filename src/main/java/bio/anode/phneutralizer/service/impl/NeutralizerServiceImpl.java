package bio.anode.phneutralizer.service.impl;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.anode.arduino.ArduinoCLI;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.exception.CommunicationException;
import bio.anode.phneutralizer.exception.NeutralizerException;
import bio.anode.phneutralizer.model.connection.ModbusConnectionParameters;
import bio.anode.phneutralizer.repository.ClockRTCRepository;
import bio.anode.phneutralizer.repository.PhNeutraliserRepository;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.model.event.NeutralizerEvent;
import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;
import bio.anode.phneutralizer.model.usage.PhNeutraliserUsage;
import bio.anode.phneutralizer.service.EventService;
import bio.anode.phneutralizer.service.NeutralizerService;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import bio.anode.phneutralizer.service.writer.ValueWriter;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URISyntaxException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Slf4j
public class NeutralizerServiceImpl implements NeutralizerService {

    private final AtomicReference<Double> lastPhEvent = new AtomicReference<>();
    private final AtomicReference<Double> lastTempEvent = new AtomicReference<>();

    private final AtomicReference<Boolean> lastNeutralizerTankLevel = new AtomicReference<>();
    private final AtomicReference<Boolean> lastAcidTankLevel = new AtomicReference<>();
    private final AtomicReference<Boolean> lastWasteLevelEvent = new AtomicReference<>();
    private final AtomicReference<Boolean> lastWasteBisLevelEvent = new AtomicReference<>();

    private static final String FQBN = "arduino:avr:uno";

    private PhNeutraliserUsage neutraliser;
    private ClockRTCComponentUsage clock;
    private final RawValueReader reader;
    private final ValueWriter writer;
    private final EventService eventService;
    private final PhNeutraliserRepository neutraliserRepository;
    private final ClockRTCRepository clockRepository;

    public NeutralizerServiceImpl(
            RawValueReader reader,
            ValueWriter writer,
            EventService eventService,
            PhNeutraliserRepository neutraliserRepository,
            ClockRTCRepository clockRepository) {
        this.reader = reader;
        this.writer = writer;
        this.eventService = eventService;
        this.neutraliserRepository = neutraliserRepository;
        this.clockRepository = clockRepository;
    }

    @PostConstruct
    public void initCommunication() {
        this.neutraliser = neutraliserRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No PhNeutraliserUsage found in database"));
        this.clock = clockRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No ClockRTCComponentUsage found in database"));

        if (!testConnection()) {
            log.info("Arduino not responding, attempting to upload sketch...");
            try {
                ArduinoCLI cli = new ArduinoCLI();
                String connectionName = ((ModbusConnectionParameters) neutraliser.getNeutralizer().getConnectionParameters()).getName();
                uploadNeutralizerSketch(cli, connectionName);
                log.info("Sketch uploaded successfully");
            } catch (URISyntaxException | IOException e) {
                log.error("Failed to upload sketch to Arduino", e);
                throw new CommunicationException("Failed to upload sketch to Arduino", e);
            }
        } else {
            log.info("Arduino connection established successfully");
        }
    }

    private boolean testConnection() {
        try {
            neutraliser.getStatus(reader);
            return true;
        } catch (Exception e) {
            log.debug("Connection test failed: {}", e.getMessage());
            return false;
        }
    }

    private void uploadNeutralizerSketch(ArduinoCLI cli, String host) throws URISyntaxException, IOException {
        URI uri = new URI(host);
        String path = uri.getPath();
        int idx = path.lastIndexOf(':');
        String device = path.substring(0, idx);
        Path sketch = extractSketchToTemp();
        cli.upload(sketch.toString(), FQBN, device);
    }

    private Path extractSketchToTemp() throws IOException {
        String resourcePath = "PhNeutralisation.ino";
        try (InputStream is = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
            if (is == null) {
                throw new FileNotFoundException("Resource not found: " + resourcePath);
            }
            Path tempDir = Files.createTempDirectory("arduino-sketch-");
            Path sketchFile = tempDir.resolve(resourcePath);
            Files.copy(is, sketchFile, StandardCopyOption.REPLACE_EXISTING);
            return sketchFile;
        }
    }

    @EventListener
    @Async
    public void handleMeasureEvent(MeasureEvent event) {
        switch (event.metricName()) {
            case "ph"              -> lastPhEvent.set((Double) event.value());
            case "degree"          -> lastTempEvent.set((Double) event.value());
            case "cpu_use"         -> log.debug("Received CPU usage event: {}%", event.value());
            case "ram_use"         -> log.debug("Received RAM usage event: {}%", event.value());
            case "disk_use"        -> log.debug("Received Disk usage event: {}%", event.value());
            case "heap_used"       -> log.debug("Received Heap usage event: {}%", event.value());
            case "cpu_temperature" -> log.debug("Received CPU temperature event: {}°C", event.value());
            case null, default     -> log.warn("Received MeasureEvent with unknown metric name: {}", event.metricName());
        }
    }

    @Override
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

    @Override
    public NeutralizerConfiguration getConfiguration() {
        log.debug("Getting configuration");
        try {
            return neutraliser.readConfiguration(reader);
        } catch (CommunicationException e) {
            log.error("Failed to get configuration", e);
            throw new CommunicationException("Failed to read configuration", e);
        }
    }

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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

    @Override
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
