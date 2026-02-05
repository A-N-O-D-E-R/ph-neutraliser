package bio.anode.phneutralizer.dto;

import bio.anode.phneutralizer.enums.CalibrationPoint;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalibrationRequest {

    @NotNull(message = "Calibration point is required")
    private CalibrationPoint point;

    @NotNull(message = "pH value is required")
    @DecimalMin(value = "0.0", message = "pH value must be at least 0")
    @DecimalMax(value = "14.0", message = "pH value must not exceed 14")
    private Double phValue;
}
