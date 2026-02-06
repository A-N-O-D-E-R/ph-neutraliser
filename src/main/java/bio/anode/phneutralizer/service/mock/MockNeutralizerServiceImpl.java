package bio.anode.phneutralizer.service.mock;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.dto.CalibrationRequest;
import bio.anode.phneutralizer.dto.HardwareStatusResponse;
import bio.anode.phneutralizer.dto.NeutralizerConfiguration;
import bio.anode.phneutralizer.dto.NeutralizerStatusResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.RunningMode;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.model.MeasureEvent;
import bio.anode.phneutralizer.model.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;
import bio.anode.phneutralizer.service.NeutralizerService;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@Profile({"test", "local"})
@Slf4j
public class MockNeutralizerServiceImpl implements NeutralizerService {

    private final EventService eventService;
    private final Random random = new Random();

    private NeutralizerConfiguration configuration;
    private RunningMode runningMode = RunningMode.MANUAL;
    private Status status = Status.IDLE;

    public MockNeutralizerServiceImpl(EventService eventService) {
        this.eventService = eventService;
        this.configuration = defaultConfiguration();
        log.info("Mock NeutralizerService initialized");
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

        double ph = 6.5 + random.nextDouble() * 1.5;
        double temp = 20.0 + random.nextDouble() * 10.0;

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
                .targetPh(configuration.getPhTarget())
                .temperature(temp)
                .status(status)
                .runningMode(runningMode)
                .acidLevel(Level.OK)
                .neutralizerLevel(random.nextBoolean() ? Level.OK : Level.FULL)
                .wasteLevel(Level.OK)
                .wasteBisLevel(Level.OK)
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
        eventService.archiveEvent(NeutralizerEvent.builder()
                .timestamp(LocalDateTime.now())
                .status(status)
                .acidTankState(Level.OK)
                .build());
    }
}
