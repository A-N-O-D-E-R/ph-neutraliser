package bio.anode.phneutralizer.model.usage;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class EmbededComputeUsage  extends NetworkingComponantUsage {

    @OneToOne
    private ThermoMeterUsage thermometerCpuUsage;
    @OneToOne
    @JoinColumn(name = "memorymetre_ram_usage_id")
    private MemorymeterUsage memorymetreRAMUsage;
    @OneToOne
    private MemorymeterUsage memorymetreDisqueUsage;
    @OneToOne
    private MemorymeterUsage memorymetreHeapUsage;

}
