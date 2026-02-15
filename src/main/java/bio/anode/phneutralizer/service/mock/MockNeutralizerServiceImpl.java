package bio.anode.phneutralizer.service.mock;

import org.springframework.context.annotation.Profile;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.RunningMode;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.model.event.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;
import bio.anode.phneutralizer.service.NeutralizerService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.concurrent.atomic.AtomicReference;

@Service
@Profile({"test", "local"})
@Slf4j
public class MockNeutralizerServiceImpl implements NeutralizerService {

    private final EventService eventService;
    private final Random random = new Random();
    private final AtomicReference<Double> lastPhEvent = new AtomicReference<>();
    private final AtomicReference<Double> lastTempEvent = new AtomicReference<>();
    

    private NeutralizerConfiguration configuration;
    private RunningMode runningMode = RunningMode.MANUAL;
    private Status status = Status.IDLE;

    public MockNeutralizerServiceImpl(EventService eventService) {
        this.eventService = eventService;
        this.configuration = defaultConfiguration();
        log.info("Mock NeutralizerService initialized");
    }

    @EventListener
    @Async
    public void handleMeasureEvent(MeasureEvent event) {
        switch (event.metricName()) {
            case "ph" -> lastPhEvent.set(event.value());
            case "degree" -> lastTempEvent.set(event.value());
            case null, default -> log.warn("Received MeasureEvent with unknown metric name: {}", event.metricName());
        }
    }


    private NeutralizerConfiguration defaultConfiguration() {
        return NeutralizerConfiguration.builder()
                .phTarget(7.0)
                .wasteSelect(1)
                .emptyingTank1(300)
                .emptyingTank2(300)
                .emptyingNeutralizer(300)
                .idleTimeBeforeNeutralization(1800)
                .neutralizationTimeout(120)
                .neutralizationPeriod(240)
                .acidPulseTiming(10)
                .acidPulsePeriod(30)
                .firstNeutralizationHour(8)
                .build();
    }

    @Override
    public NeutralizerStatusResponse getStatus() {
        log.debug("[MOCK] Getting neutralizer status");
        return NeutralizerStatusResponse.builder()
                .currentPh(lastPhEvent.get())
                .targetPh(configuration.getPhTarget())
                .temperature(lastTempEvent.get())
                .status(status)
                .runningMode(runningMode)
                .acidLevel(random.nextBoolean() ? Level.OK : Level.LOW)
                .neutralizerLevel(random.nextBoolean() ? Level.OK : Level.HIGH)
                .wasteLevel(random.nextBoolean() ? Level.OK : Level.HIGH)
                .wasteBisLevel(random.nextBoolean() ? Level.OK : Level.HIGH)
                .systemTime(LocalDateTime.now())
                .configuration(configuration)
                .build();
    }

    @Override
    public NeutralizerConfiguration getConfiguration() {
        log.debug("[MOCK] Getting configuration");
        return configuration;
    }

    @Override
    public void updateConfiguration(NeutralizerConfiguration config) {
        log.info("[MOCK] Updating configuration: {}", config);
        this.configuration = config;
    }

    @Override
    public void startAutomaticMode() {
        log.info("[MOCK] Starting automatic mode");
        this.runningMode = RunningMode.AUTOMATIC;
        this.status = Status.IDLE;
        logStatusEvent(Status.IDLE);
    }

    @Override
    public void stopAutomaticMode() {
        log.info("[MOCK] Stopping automatic mode");
        this.runningMode = RunningMode.MANUAL;
    }

    @Override
    public void triggerNeutralization() {
        log.info("[MOCK] Triggering neutralization");
        this.status = Status.NEUTRALIZING;
        logStatusEvent(Status.NEUTRALIZING);
    }

    @Override
    public void emptyTank1(int duration) {
        log.info("[MOCK] Emptying tank 1 for {} seconds", duration);
        this.status = Status.MANUALLY_EMPTYING_WASTE;
        logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
    }

    @Override
    public void emptyTank2(int duration) {
        log.info("[MOCK] Emptying tank 2 for {} seconds", duration);
        this.status = Status.MANUALLY_EMPTYING_WASTE;
        logStatusEvent(Status.MANUALLY_EMPTYING_WASTE);
    }

    @Override
    public void emptyNeutralizer(int duration) {
        log.info("[MOCK] Emptying neutralizer for {} seconds", duration);
        this.status = Status.FORCING_EMPTYING_NEUTRALIZER;
        logStatusEvent(Status.FORCING_EMPTYING_NEUTRALIZER);
    }

    @Override
    public void activateAcidPump(int timing) {
        log.info("[MOCK] Activating acid pump for {} seconds", timing);
        this.status = Status.MANUALLY_PUMPING_ACID;
        logStatusEvent(Status.MANUALLY_PUMPING_ACID);
    }

    @Override
    public void activateAgitation(int period) {
        log.info("[MOCK] Activating agitation for {} seconds", period);
        this.status = Status.MANUALLY_BULLING;
        logStatusEvent(Status.MANUALLY_BULLING);
    }

    @Override
    public void calibratePh(CalibrationRequest request) {
        log.info("[MOCK] Calibrating pH at {} point with value {}", request.getPoint(), request.getPhValue());
    }

    @Override
    public HardwareStatusResponse getHardwareStatus() {
        log.debug("[MOCK] Getting hardware status");
        return HardwareStatusResponse.builder()
                .connected(true)
                .portName("MOCK")
                .baudrate(38400)
                .slaveId(1)
                .relayStatus(0)
                .deviceTime(LocalDateTime.now())
                .firmwareVersion("MOCK-1.0.0")
                .build();
    }

    @Override
    public void synchronizeTime() {
        log.info("[MOCK] Synchronizing device time");
    }

    private void logStatusEvent(Status status) {
        eventService.archiveEvent(new NeutralizerEvent(LocalDateTime.now(),status,Level.OK));
    }
}
