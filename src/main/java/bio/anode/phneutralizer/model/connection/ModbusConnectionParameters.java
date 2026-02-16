package bio.anode.phneutralizer.model.connection;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@DiscriminatorValue("MODBUS")
public class ModbusConnectionParameters extends ConnectionParameters {
    private String name;
    private int slaveId;
    private int offset;
}
