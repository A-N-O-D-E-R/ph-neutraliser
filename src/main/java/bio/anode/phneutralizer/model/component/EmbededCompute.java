package bio.anode.phneutralizer.model.component;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("EMBEDED_COMPUTE")
@Getter
@Setter
@NoArgsConstructor
public class EmbededCompute extends NetworkingComponent {

    @Enumerated(EnumType.STRING)
    private CPUArchitecture arch;
    @Enumerated(EnumType.STRING)
    private OSType os;

    public enum CPUArchitecture{
        X86_64,
        ARM;
    }

    public enum OSType{
        DOS,
        UNIX,
        DARWIN;
    }

}
