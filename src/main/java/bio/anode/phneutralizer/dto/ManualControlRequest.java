package bio.anode.phneutralizer.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ManualControlRequest {

    @Min(value = 0, message = "Duration must be at least 0")
    @Max(value = 15, message = "Duration must not exceed 15 minutes")
    private Integer duration;

    @Min(value = 1, message = "Timing must be at least 1 second")
    @Max(value = 30, message = "Timing must not exceed 30 seconds")
    private Integer timing;

    @Min(value = 1, message = "Period must be at least 1 minute")
    @Max(value = 10, message = "Period must not exceed 10 minutes")
    private Integer period;
}
