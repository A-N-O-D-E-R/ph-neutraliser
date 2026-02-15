package bio.anode.phneutralizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

import bio.anode.phneutralizer.model.event.Event;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventResponse {
    private List<? extends Event> events;
    private long totalCount;
    private LocalDate startDate;
    private LocalDate endDate;
}
