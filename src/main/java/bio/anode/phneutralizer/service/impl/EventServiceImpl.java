package bio.anode.phneutralizer.service.impl;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.anode.logging.EventMarkers;
import com.anode.logging.reader.EventLogReader;
import com.anode.logging.reader.EventXmlLogReader;

import bio.anode.phneutralizer.dto.AvailableDatesResponse;
import bio.anode.phneutralizer.dto.EventFilterRequest;
import bio.anode.phneutralizer.dto.EventResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.model.MeasureEvent;
import bio.anode.phneutralizer.model.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventServiceImpl implements EventService {

    private final Path archiveDir;
    private final EventLogReader jsonReader;
    private final EventXmlLogReader xmlReader;

    public EventServiceImpl(@Value("${logging.event.path}") Path archiveDir) {
        this.archiveDir = archiveDir;
        this.jsonReader = new EventLogReader(archiveDir);
        this.xmlReader = new EventXmlLogReader(archiveDir);
    }

    @Override
    public EventResponse getMeasureEvents(EventFilterRequest filter) {
        log.debug("Getting measure events with filter: {}", filter);

        List<MeasureEvent> events = readMeasureEvents(filter);
        List<MeasureEvent> filtered = filterMeasureEvents(events, filter);

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

        List<NeutralizerEvent> events = readNeutralizerEvents(filter);
        List<NeutralizerEvent> filtered = filterNeutralizerEvents(events, filter);

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
                .logType(filter.getLogType())
                .metricName("PH")
                .build();
        return filterMeasureEvents(readMeasureEvents(phFilter), phFilter);
    }

    @Override
    public List<MeasureEvent> getTemperatureEvents(EventFilterRequest filter) {
        log.debug("Getting temperature events");
        EventFilterRequest tempFilter = EventFilterRequest.builder()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .logType(filter.getLogType())
                .metricName("TEMPERATURE")
                .build();
        return filterMeasureEvents(readMeasureEvents(tempFilter), tempFilter);
    }

    @Override
    public List<NeutralizerEvent> getStatusEvents(EventFilterRequest filter) {
        log.debug("Getting status events");
        return filterNeutralizerEvents(readNeutralizerEvents(filter), filter);
    }

    @Override
    public AvailableDatesResponse getAvailableDates() {
        log.debug("Getting available dates");
        List<LocalDate> dates = jsonReader.getAvailableDates();
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

        List<MeasureEvent> events = filterMeasureEvents(readMeasureEvents(filter), filter);
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
        log.info(EventMarkers.EVENT, "{}", event);
    }

    @Override
    public void archiveEvent(NeutralizerEvent event) {
        log.debug("Archiving neutralizer event: {}", event);
        log.info(EventMarkers.EVENT, "{}", event);
    }

    private List<MeasureEvent> readMeasureEvents(EventFilterRequest filter) {
        if ("xml".equalsIgnoreCase(filter.getLogType())) {
            return xmlReader.readEvents("MeasureEvent", attrs -> MeasureEvent.builder()
                    .timestamp(parseDateTime(attrs.get("timestamp")))
                    .metricName(attrs.get("metricName"))
                    .value(parseDouble(attrs.get("value")))
                    .unit(attrs.get("unit"))
                    .build(),
                filter.getStartDate(), filter.getEndDate());
        }
        // Default to JSON
        return jsonReader.readEvents(
            MeasureEvent.class,
            "MeasureEvent",
            filter.getStartDate(),
            filter.getEndDate()
        );
    }

    private List<NeutralizerEvent> readNeutralizerEvents(EventFilterRequest filter) {
        if ("xml".equalsIgnoreCase(filter.getLogType())) {
            return xmlReader.readEvents("NeutralizerEvent", attrs -> NeutralizerEvent.builder()
                    .timestamp(parseDateTime(attrs.get("timestamp")))
                    .status(parseEnum(Status.class, attrs.get("status")))
                    .acidTankState(parseEnum(Level.class, attrs.get("acidTankState")))
                    .build(),
                filter.getStartDate(), filter.getEndDate());
        }
        // Default to JSON
        return jsonReader.readEvents(
            NeutralizerEvent.class,
            "NeutralizerEvent",
            filter.getStartDate(),
            filter.getEndDate()
        );
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) return null;
        return LocalDateTime.parse(value);
    }

    private Double parseDouble(String value) {
        if (value == null || value.isBlank()) return null;
        return Double.parseDouble(value);
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumType, String value) {
        if (value == null || value.isBlank()) return null;
        return Enum.valueOf(enumType, value);
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
