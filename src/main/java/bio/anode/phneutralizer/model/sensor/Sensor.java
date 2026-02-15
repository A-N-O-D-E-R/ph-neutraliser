package bio.anode.phneutralizer.model.sensor;

import java.util.UUID;

import bio.anode.phneutralizer.model.Model;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Sensor {

    @Id
    private UUID id;

    @ManyToOne
    private Model model;

    @Enumerated(EnumType.STRING)
    private Type type;

    private String serialNumber;

    private int version;

    private Double sensibility;

    private String unit;

    public enum Type {
        PHMETER,
        THERMOMETER,
    }
}
