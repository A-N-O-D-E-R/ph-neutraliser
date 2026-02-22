package bio.anode.phneutralizer.model.component.actuator;

import bio.anode.phneutralizer.model.component.NetworkingComponent;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Actuator extends NetworkingComponent {
    private transient State state = State.UNKNOWN;
	private Type type;


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
