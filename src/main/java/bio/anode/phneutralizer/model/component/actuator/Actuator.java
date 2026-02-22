package bio.anode.phneutralizer.model.component.actuator;

import bio.anode.phneutralizer.model.component.NetworkingComponent;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("ACTUATOR")
@Getter
@Setter
@NoArgsConstructor
public class Actuator extends NetworkingComponent {
    private transient State state = State.UNKNOWN;
    @Enumerated(EnumType.STRING)
	private Type actuatorType;


    public enum Type{
        AUTOMATA,
        SIMPLE;
    }

    public enum State{
        WAITING,
        IDLE,
        UNKNOWN,
        BUZY;
    }
}
