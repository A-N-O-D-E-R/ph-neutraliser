package bio.anode.phneutralizer.service;

import java.util.List;

import bio.anode.phneutralizer.dto.AvailableDatesResponse;
import bio.anode.phneutralizer.dto.EventFilterRequest;
import bio.anode.phneutralizer.dto.EventResponse;
import bio.anode.phneutralizer.model.MeasureEvent;
import bio.anode.phneutralizer.model.NeutralizerEvent;

public interface EventService {

    EventResponse getMeasureEvents(EventFilterRequest filter);

    EventResponse getNeutralizerEvents(EventFilterRequest filter);

    List<MeasureEvent> getPhEvents(EventFilterRequest filter);

    List<MeasureEvent> getTemperatureEvents(EventFilterRequest filter);

    List<NeutralizerEvent> getStatusEvents(EventFilterRequest filter);

    AvailableDatesResponse getAvailableDates();

    byte[] exportEventsAsCsv(EventFilterRequest filter);

    void archiveEvent(MeasureEvent event);

    void archiveEvent(NeutralizerEvent event);
}
