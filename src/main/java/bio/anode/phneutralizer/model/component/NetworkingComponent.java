package bio.anode.phneutralizer.model.component;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;
import jakarta.persistence.Entity;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public abstract class NetworkingComponent  extends Component {
    @ManyToOne
    private ConnectionParameters connectionParameters;
}
