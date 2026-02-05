package bio.anode.phneutralizer.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.RunningMode;
import bio.anode.phneutralizer.enums.Status;

@Data
@Builder
public class NeutralizerStatusResponse {
    private Double currentPh;
    private Double targetPh;
    private Double temperature;
    private Status status;
    private RunningMode runningMode;
    private Level acidLevel;
    private Level neutralizerLevel;
    private Level wasteLevel;
    private Level wasteBisLevel;
    private LocalDateTime systemTime;
    private NeutralizerConfiguration configuration;
}
