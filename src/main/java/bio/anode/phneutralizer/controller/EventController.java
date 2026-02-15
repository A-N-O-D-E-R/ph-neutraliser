package bio.anode.phneutralizer.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import bio.anode.phneutralizer.dto.*;
import bio.anode.phneutralizer.model.event.MeasureEvent;
import bio.anode.phneutralizer.model.event.NeutralizerEvent;
import bio.anode.phneutralizer.service.EventService;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@Tag(name = "Events", description = "APIs for accessing event logs and historical data")
public class EventController {

    private static final Logger log = LoggerFactory.getLogger(EventController.class);

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping("/measures")
    @Operation(summary = "Get measure events", description = "Returns pH and temperature measurement events")
    public ResponseEntity<ApiResponse<EventResponse>> getMeasureEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String metricName) {
        log.debug("GET /events/measures");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .metricName(metricName)
                .build();
        EventResponse events = eventService.getMeasureEvents(filter);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/neutralizer")
    @Operation(summary = "Get neutralizer events", description = "Returns neutralizer status change events")
    public ResponseEntity<ApiResponse<EventResponse>> getNeutralizerEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.debug("GET /events/neutralizer");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .build();
        EventResponse events = eventService.getNeutralizerEvents(filter);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/ph")
    @Operation(summary = "Get pH events", description = "Returns pH measurement events only")
    public ResponseEntity<ApiResponse<List<MeasureEvent>>> getPhEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.debug("GET /events/ph");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .build();
        List<MeasureEvent> events = eventService.getPhEvents(filter);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/temperature")
    @Operation(summary = "Get temperature events", description = "Returns temperature measurement events only")
    public ResponseEntity<ApiResponse<List<MeasureEvent>>> getTemperatureEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.debug("GET /events/temperature");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .build();
        List<MeasureEvent> events = eventService.getTemperatureEvents(filter);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/status")
    @Operation(summary = "Get status events", description = "Returns status change events")
    public ResponseEntity<ApiResponse<List<NeutralizerEvent>>> getStatusEvents(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        log.debug("GET /events/status");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .build();
        List<NeutralizerEvent> events = eventService.getStatusEvents(filter);
        return ResponseEntity.ok(ApiResponse.success(events));
    }

    @GetMapping("/available-dates")
    @Operation(summary = "Get available dates", description = "Returns list of dates that have archived events")
    public ResponseEntity<ApiResponse<AvailableDatesResponse>> getAvailableDates() {
        log.debug("GET /events/available-dates");
        AvailableDatesResponse dates = eventService.getAvailableDates();
        return ResponseEntity.ok(ApiResponse.success(dates));
    }

    @GetMapping("/export/csv")
    @Operation(summary = "Export events as CSV", description = "Downloads events in CSV format")
    public ResponseEntity<byte[]> exportEventsAsCsv(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String metricName,
            @RequestParam(required = false, defaultValue = "true") Boolean includeHeader) {
        log.info("GET /events/export/csv");
        EventFilterRequest filter = EventFilterRequest.builder()
                .startDate(startDate)
                .endDate(endDate)
                .metricName(metricName)
                .includeHeader(includeHeader)
                .build();
        byte[] csvContent = eventService.exportEventsAsCsv(filter);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv"));
        headers.setContentDispositionFormData("attachment", "events.csv");

        return ResponseEntity.ok()
                .headers(headers)
                .body(csvContent);
    }
}
