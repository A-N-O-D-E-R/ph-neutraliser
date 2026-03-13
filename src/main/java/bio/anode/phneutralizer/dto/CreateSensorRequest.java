package bio.anode.phneutralizer.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CreateSensorRequest {
    private String usageType;      // PHMETER, THERMOMETER, MEMORYMETER, TANKLEVEL
    private String modelName;
    private String serialNumber;
    private String metricName;     // optional, defaults per type
    private String connectionType; // MODBUS or SYSTEM
    // MODBUS params
    private String portName;
    private Integer slaveId;
    private Integer offset;
    // SYSTEM params
    private String poolName;
}
