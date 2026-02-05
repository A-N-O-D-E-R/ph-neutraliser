package bio.anode.phneutralizer.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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
public class NeutralizerConfiguration {

    @DecimalMin(value = "6.0", message = "pH target must be at least 6.0")
    @DecimalMax(value = "9.5", message = "pH target must not exceed 9.5")
    private Double phTarget;

    @Min(value = 1, message = "Waste tank selection must be 1 or 2")
    @Max(value = 2, message = "Waste tank selection must be 1 or 2")
    private Integer wasteSelect;

    @Min(value = 0, message = "Emptying time must be at least 0")
    @Max(value = 15, message = "Emptying time must not exceed 15 minutes")
    private Integer emptyingTank1;

    @Min(value = 0, message = "Emptying time must be at least 0")
    @Max(value = 15, message = "Emptying time must not exceed 15 minutes")
    private Integer emptyingTank2;

    @Min(value = 0, message = "Emptying time must be at least 0")
    @Max(value = 15, message = "Emptying time must not exceed 15 minutes")
    private Integer emptyingNeutralizer;

    @Min(value = 1, message = "Idle time must be at least 1 minute")
    @Max(value = 120, message = "Idle time must not exceed 120 minutes")
    private Integer idleTimeBeforeNeutralization;

    @Min(value = 1, message = "Neutralization timeout must be at least 1 hour")
    @Max(value = 10, message = "Neutralization timeout must not exceed 10 hours")
    private Integer neutralizationTimeout;

    @Min(value = 0, message = "Neutralization period must be at least 0")
    @Max(value = 12, message = "Neutralization period must not exceed 12")
    private Integer neutralizationPeriod;

    @Min(value = 1, message = "Acid pulse timing must be at least 1 second")
    @Max(value = 30, message = "Acid pulse timing must not exceed 30 seconds")
    private Integer acidPulseTiming;

    @Min(value = 1, message = "Acid pulse period must be at least 1 minute")
    @Max(value = 10, message = "Acid pulse period must not exceed 10 minutes")
    private Integer acidPulsePeriod;

    @Min(value = 0, message = "First neutralization hour must be between 0 and 23")
    @Max(value = 23, message = "First neutralization hour must be between 0 and 23")
    private Integer firstNeutralizationHour;
}
