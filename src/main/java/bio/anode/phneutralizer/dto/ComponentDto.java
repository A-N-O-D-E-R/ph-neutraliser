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
public class ComponentDto {
    private UUID id;
    private String type;
    private String serialNumber;
    private int version;
    private String modelName;
    private String supplierName;
}
