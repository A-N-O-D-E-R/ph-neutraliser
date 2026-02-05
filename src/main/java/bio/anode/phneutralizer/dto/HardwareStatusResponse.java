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
public class HardwareStatusResponse {
    private boolean connected;
    private String portName;
    private int baudrate;
    private int slaveId;
    private int relayStatus;
    private LocalDateTime deviceTime;
    private String firmwareVersion;
}
