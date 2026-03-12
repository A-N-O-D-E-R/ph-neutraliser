package bio.anode.phneutralizer.dto;

import lombok.Data;

@Data
public class UsageConnectionRequest {
    private String portName;
    private Integer slaveId;
    private Integer offset;
}
