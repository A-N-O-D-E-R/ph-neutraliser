package bio.anode.phneutralizer.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.anode.logging.EventMarkers;
import com.anode.logging.reader.EventLogReader;
import com.anode.logging.reader.EventXmlLogReader;

import bio.anode.phneutralizer.dto.AvailableDatesResponse;
import bio.anode.phneutralizer.dto.EventFilterRequest;
import bio.anode.phneutralizer.dto.EventResponse;
import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.model.event.NeutralizerEvent;
import lombok.extern.slf4j.Slf4j;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EventService {

    private final EventLogReader jsonReader;
    private final EventXmlLogReader xmlReader;

    public EventService(@Value("${logging.event.path}") Path archiveDir) {
        this.jsonReader = new EventLogReader(archiveDir);
        this.xmlReader = new EventXmlLogReader(archiveDir);
    }

    
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

    
    public List<MeasureEvent> getPhEvents(EventFilterRequest filter) {
        log.debug("Getting pH events");
        EventFilterRequest phFilter = EventFilterRequest.builder()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .logType(filter.getLogType())
                .metricName("ph") // TODO: should use the sensor usage metric name instead of hardcoding "ph"
                .build();
        return filterMeasureEvents(readMeasureEvents(phFilter), phFilter);
    }

    
    public List<MeasureEvent> getTemperatureEvents(EventFilterRequest filter) {
        log.debug("Getting temperature events");
        EventFilterRequest tempFilter = EventFilterRequest.builder()
                .startDate(filter.getStartDate())
                .endDate(filter.getEndDate())
                .logType(filter.getLogType())
                .metricName("degree") // TODO: should use the sensor usage metric name instead of hardcoding "degree"
                .build();
        return filterMeasureEvents(readMeasureEvents(tempFilter), tempFilter);
    }

    
    public List<NeutralizerEvent> getStatusEvents(EventFilterRequest filter) {
        log.debug("Getting status events");
        return filterNeutralizerEvents(readNeutralizerEvents(filter), filter);
    }

    
    public AvailableDatesResponse getAvailableDates() {
        log.debug("Getting available dates");
        List<LocalDate> dates = jsonReader.getAvailableDates();
        return AvailableDatesResponse.builder()
                .availableDates(dates)
                .build();
    }

    
    public byte[] exportEventsAsCsv(EventFilterRequest filter) {
        log.debug("Exporting events as CSV with filter: {}", filter);
        StringBuilder csv = new StringBuilder();

        if (filter.getIncludeHeader() == null || filter.getIncludeHeader()) {
            csv.append("Timestamp,Metric,Value,Unit\n");
        }

        List<MeasureEvent> events = filterMeasureEvents(readMeasureEvents(filter), filter);
        for (MeasureEvent event : events) { 
            csv.append(toCsvLine(event));
        }
        return csv.toString().getBytes(StandardCharsets.UTF_8);
    }



    private String toCsvLine(MeasureEvent event) {
        String timestamp = event.timestamp() != null ? event.timestamp().toString() : "";
        String metric = event.metricName() != null ? event.metricName() : "";
        String unit = event.unit() != null ? event.unit() : "";

        String formattedValue = switch (event.value()) {
            case Boolean b -> Boolean.toString(b);
            case Number n -> String.format("%.2f", n.doubleValue());
            case null -> "";
            default -> event.value().toString();
        };

        return String.format("%s,%s,%s,%s%n", timestamp, metric, formattedValue, unit);
    }




    @Async
    @EventListener
    public void archiveEvent(MeasureEvent event) {
        log.debug("Archiving measure event: {}", event);
        log.info(EventMarkers.EVENT, "{}", event);
    }

    
    public void archiveEvent(NeutralizerEvent event) {
        log.debug("Archiving neutralizer event: {}", event);
        log.info(EventMarkers.EVENT, "{}", event);
    }

    private List<MeasureEvent> readMeasureEvents(EventFilterRequest filter) {
        if ("xml".equalsIgnoreCase(filter.getLogType())) {
            return xmlReader.readEvents("MeasureEvent", attrs ->new  MeasureEvent(
                    parseDateTime(attrs.get("timestamp")),
                    attrs.get("metricName"),
                    parseDouble(attrs.get("value")),
                    (attrs.get("unit")),
                 UUID.fromString(attrs.get("sensorId"))),
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
            return xmlReader.readEvents("NeutralizerEvent", attrs -> new NeutralizerEvent(
                    parseDateTime(attrs.get("timestamp")),
                    parseEnum(Status.class, attrs.get("status")),
                    parseEnum(Level.class, attrs.get("acidTankState"))),
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
                .filter(e -> filter.getStartDate() == null || !e.timestamp().isBefore(filter.getStartDate()))
                .filter(e -> filter.getEndDate() == null || !e.timestamp().isAfter(filter.getEndDate()))
                .filter(e -> filter.getMetricName() == null || filter.getMetricName().equalsIgnoreCase(e.metricName()))
                .sorted()
                .collect(Collectors.toList());
    }

    private List<NeutralizerEvent> filterNeutralizerEvents(List<NeutralizerEvent> events, EventFilterRequest filter) {
        return events.stream()
                .filter(e -> filter.getStartDate() == null || !e.timestamp().isBefore(filter.getStartDate()))
                .filter(e -> filter.getEndDate() == null || !e.timestamp().isAfter(filter.getEndDate()))
                .sorted()
                .collect(Collectors.toList());
    }
}
