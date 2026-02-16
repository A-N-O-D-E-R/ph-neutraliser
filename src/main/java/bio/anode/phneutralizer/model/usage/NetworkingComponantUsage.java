package bio.anode.phneutralizer.model.usage;

import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class NetworkingComponantUsage extends ComponantUsage {
	private boolean accessible;
}
