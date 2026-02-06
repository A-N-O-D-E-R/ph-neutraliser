package bio.anode.phneutralizer.model;

import java.time.LocalDateTime;
public record MeasureEvent(LocalDateTime timestamp, String metricName, Double value, String unit) implements Event {}