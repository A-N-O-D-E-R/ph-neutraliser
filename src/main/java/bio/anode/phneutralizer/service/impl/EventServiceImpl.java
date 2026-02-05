package bio.anode.phneutralizer.service.impl;

import jakarta.annotation.PostConstruct;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import bio.anode.phneutralizer.dto.AvailableDatesResponse;
import bio.anode.phneutralizer.dto.EventFilterRequest;
import bio.anode.phneutralizer.dto.EventResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.model.MeasureEvent;
import bio.anode.phneutralizer.model.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private static final Logger log = LoggerFactory.getLogger(EventServiceImpl.class);

    @Value("${neutralizer.archive.dir:#{systemProperties['java.io.tmpdir']}}")
    private Path archiveDir;

    @PostConstruct
    public void initArchiveDir() {
        try {
            archiveDir = archiveDir.resolve("backup");
            Files.createDirectories(archiveDir);

            if (!Files.isWritable(archiveDir)) {
                throw new IllegalStateException(
                    "Archive dir not writable: " + archiveDir
                );
            }
        } catch (IOException e) {
            throw new IllegalStateException(
                "Failed to init archive dir: " + archiveDir, e
            );
        }
    }

    // In-memory event storage (in a real implementation, this would use file-based XML storage)
    private final List<MeasureEvent> measureEvents = new ArrayList<>();
    private final List<NeutralizerEvent> neutralizerEvents = new ArrayList<>();

    public EventServiceImpl() {
        // Initialize with some sample data
        initializeSampleData();
    }

    private void initializeSampleData() {
        LocalDateTime now = LocalDateTime.now();
        for (int i = 0; i < 24; i++) {
            measureEvents.add(MeasureEvent.builder()
                    .timestamp(now.minusHours(i))
                    .metricName("PH")
                    .value(7.0 + (Math.random() - 0.5))
                    .unit("pH")
                    .build());
            measureEvents.add(MeasureEvent.builder()
                    .timestamp(now.minusHours(i))
                    .metricName("TEMPERATURE")
                    .value(25.0 + (Math.random() * 5))
                    .unit("°C")
                    .build());
        }
        neutralizerEvents.add(NeutralizerEvent.builder()
                .timestamp(now.minusHours(2))
                .status(Status.NEUTRALIZING)
                .acidTankState(Level.OK)
                .build());
        neutralizerEvents.add(NeutralizerEvent.builder()
                .timestamp(now.minusHours(1))
                .status(Status.IDLE)
                .acidTankState(Level.OK)
                .build());
    }

    @Override
    public EventResponse getMeasureEvents(EventFilterRequest filter) {
        log.debug("Getting measure events with filter: {}", filter);
        List<MeasureEvent> filtered = filterMeasureEvents(measureEvents, filter);
        return EventResponse.builder()
                .events(filtered)
                .totalCount(filtered.size())
                .startDate(filter.getStartDate() != null ? filter.getStartDate().toLocalDate() : null)
                .endDate(filter.getEndDate() != null ? filter.getEndDate().toLocalDate() : null)
                .build();
    }

    @Override
    public EventResponse getNeutralizerEvents(EventFilterRequest filter) {
        log.debug("Getting neutralizer events with filter: {}", filter);
        List<NeutralizerEvent> filtered = filterNeutralizerEvents(neutralizerEvents, filter);
        return EventResponse.builder()
                .events(filtered)
                .totalCount(filtered.size())
                .startDate(filter.getStartDate() != null ? filter.getStartDate().toLocalDate() : null)
                .endDate(filter.getEndDate() != null ? filter.getEndDate().toLocalDate() : null)
                .build();
    }

    @Override
    public List<MeasureEvent> getPhEvents(EventFilterRequest filter) {
        log.debug("Getting pH events");
        EventFilterRequest phFilter = EventFilterRequest.builder()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .metricName("PH")
                .build();
        return filterMeasureEvents(measureEvents, phFilter);
    }

    @Override
    public List<MeasureEvent> getTemperatureEvents(EventFilterRequest filter) {
        log.debug("Getting temperature events");
        EventFilterRequest tempFilter = EventFilterRequest.builder()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .metricName("TEMPERATURE")
                .build();
        return filterMeasureEvents(measureEvents, tempFilter);
    }

    @Override
    public List<NeutralizerEvent> getStatusEvents(EventFilterRequest filter) {
        log.debug("Getting status events");
        return filterNeutralizerEvents(neutralizerEvents, filter);
    }

    @Override
    public AvailableDatesResponse getAvailableDates() {
        log.debug("Getting available dates");
        // In a real implementation, this would scan the archive directory
        List<LocalDate> dates = measureEvents.stream()
                .map(e -> e.getTimestamp().toLocalDate())
                .distinct()
                .sorted()
                .collect(Collectors.toList());
        return AvailableDatesResponse.builder()
                .availableDates(dates)
                .build();
    }

    @Override
    public byte[] exportEventsAsCsv(EventFilterRequest filter) {
        log.debug("Exporting events as CSV with filter: {}", filter);
        StringBuilder csv = new StringBuilder();

        if (filter.getIncludeHeader() == null || filter.getIncludeHeader()) {
            csv.append("Timestamp,Metric,Value,Unit\n");
        }

        List<MeasureEvent> events = filterMeasureEvents(measureEvents, filter);
        for (MeasureEvent event : events) {
            csv.append(String.format("%s,%s,%.2f,%s\n",
                    event.getTimestamp(),
                    event.getMetricName(),
                    event.getValue(),
                    event.getUnit()));
        }

        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }

    @Override
    public void archiveEvent(MeasureEvent event) {
        log.debug("Archiving measure event: {}", event);
        measureEvents.add(event);
    }

    @Override
    public void archiveEvent(NeutralizerEvent event) {
        log.debug("Archiving neutralizer event: {}", event);
        neutralizerEvents.add(event);
    }

    private List<MeasureEvent> filterMeasureEvents(List<MeasureEvent> events, EventFilterRequest filter) {
        return events.stream()
                .filter(e -> filter.getStartDate() == null || !e.getTimestamp().isBefore(filter.getStartDate()))
                .filter(e -> filter.getEndDate() == null || !e.getTimestamp().isAfter(filter.getEndDate()))
                .filter(e -> filter.getMetricName() == null || filter.getMetricName().equalsIgnoreCase(e.getMetricName()))
                .sorted()
                .collect(Collectors.toList());
    }

    private List<NeutralizerEvent> filterNeutralizerEvents(List<NeutralizerEvent> events, EventFilterRequest filter) {
        return events.stream()
                .filter(e -> filter.getStartDate() == null || !e.getTimestamp().isBefore(filter.getStartDate()))
                .filter(e -> filter.getEndDate() == null || !e.getTimestamp().isAfter(filter.getEndDate()))
                .sorted()
                .collect(Collectors.toList());
    }
}
