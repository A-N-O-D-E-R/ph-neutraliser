
package bio.anode.phneutralizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EventFilterRequest {
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String metricName;
    private String logType;
    private String locale;
    private Boolean includeHeader;
}
