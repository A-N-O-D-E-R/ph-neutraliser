package bio.anode.phneutralizer.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.exception.ConnectorInstanciationException;
import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import bio.anode.phneutralizer.model.usage.SensorUsage;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.repository.HardwareRepository;
import bio.anode.phneutralizer.service.reader.RawValueReader;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
@RequiredArgsConstructor
public class SensorMonitorService {

    private final Map<SensorUsage, SensorMonitor> monitors = new ConcurrentHashMap<>();
    private final TaskScheduler taskScheduler;
    private final ApplicationEventPublisher eventPublisher;
    private final HardwareRepository hardwareRepository;
    private final RawValueReader reader;

    @EventListener(ApplicationReadyEvent.class)
    public void init() throws ConnectorInstanciationException {
        List<SensorUsage> sensorUsages = hardwareRepository.findAll();
        log.info("nb loaded sensors : {}", sensorUsages.size());

        loadSensors(sensorUsages);
        loadAndScheduleMonitors(sensorUsages);
    }

    private void loadAndScheduleMonitors(List<SensorUsage> sensorUsages) {
        log.info("Loading and scheduling monitors for {} sensors", sensorUsages);
        for (SensorUsage usage : sensorUsages) {

            if (usage == null || !usage.isInstalled()) {
                continue;
            }
            
            SensorMonitor monitor = new SensorMonitor(usage);
            monitors.put(usage, monitor);
            log.info("Scheduled monitor for sensor {} with update frequency {} ms", usage.getName(), usage.getUpdateFrequency());
            // Schedule each monitor with its own frequency
            taskScheduler.scheduleWithFixedDelay(
                    monitor::check,
                    usage.getUpdateFrequency()
            );
        }
    }

    private void loadSensors(List<SensorUsage> sensorUsages) throws ConnectorInstanciationException {
		for (SensorUsage sensorUsage : sensorUsages) {
			ConnectionParameters sondeConnector = sensorUsage.getSensor().getConnectionParameters();
			
			if (sondeConnector.isManaged() && sensorUsage.isInstalled())
				try {
					// Start Managed Connection
				} catch (Exception e) {
					log.warn("While starting sonde "+sensorUsage.getName(),e) ;					
				}
		}
	}


    public class SensorMonitor {

        private final SensorUsage sensorUsage;
        private double highThreshold;
        private double lowThreshold;

        public SensorMonitor(SensorUsage sensorUsage) {
            this.sensorUsage = sensorUsage;
            double s = sensorUsage.getSensibilite();
            this.highThreshold = s;
            this.lowThreshold = -s;
        }

        public void check() {
            double value = sensorUsage.getMesure(reader);

            if (value > highThreshold || value < lowThreshold) {
                onThresholdCrossed(value,sensorUsage.getMetricName(),sensorUsage.getUnit());
                updateThresholds(value);
            }
        }

        private void onThresholdCrossed(double value, String metricName, String unit) {
            eventPublisher.publishEvent(new MeasureEvent(LocalDateTime.now(),metricName,value,unit));
        }

        private void updateThresholds(double value) {
            double s = sensorUsage.getSensibilite();
            this.highThreshold = value + s;
            this.lowThreshold = value - s;
        }
}

}
