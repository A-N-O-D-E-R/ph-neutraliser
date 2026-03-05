package bio.anode.phneutralizer.model.event;

import java.time.LocalDateTime;
import java.util.UUID;

import bio.anode.phneutralizer.model.component.sensor.Sensor;
public record MeasureEvent(LocalDateTime timestamp, String metricName, Object value, String unit, UUID sensorId) implements Event {}