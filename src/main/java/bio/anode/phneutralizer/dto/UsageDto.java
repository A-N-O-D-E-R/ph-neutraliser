package bio.anode.phneutralizer.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsageDto {
    private UUID id;
    private String name;
    private String category;
    private String usageType;
    private boolean accessible;
    private int version;
    private String componentSerialNumber;
    private String componentModelName;
    private Boolean installed;
    private String metricName;
    private String unit;
}
