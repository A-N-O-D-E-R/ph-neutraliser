package bio.anode.phneutralizer.model.component;

import java.util.UUID;

import bio.anode.phneutralizer.model.Model;
import jakarta.persistence.DiscriminatorColumn;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.ManyToOne;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "component_type")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public abstract class Component {
    @Id
    private UUID id;
    @ManyToOne
    private Model model;
    private String serialNumber;
    private int version;
}
