package bio.anode.phneutralizer.model;

import java.util.UUID;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    private UUID id;

    private String name;

    @Enumerated(EnumType.STRING)
    private Type type;

    public enum Type {
        INTERNAL,
        CONTRACTOR,
        SHOP
    }
}
