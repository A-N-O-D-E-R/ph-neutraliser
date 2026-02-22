package bio.anode.phneutralizer.model.component.sensor;

import bio.anode.phneutralizer.model.component.NetworkingComponent;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("SENSOR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sensor extends NetworkingComponent{

    @Enumerated(EnumType.STRING)
    private Type type;

    private Double sensibility;

    private String unit;

    public enum Type {
        PHMETER,
        THERMOMETER,
        MEMORYMETER,
        TANKLEVEL;
    }
}
