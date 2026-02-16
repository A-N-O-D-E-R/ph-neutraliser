package bio.anode.phneutralizer.model.usage;

import java.util.UUID;

import bio.anode.phneutralizer.model.component.Component;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MappedSuperclass;
import lombok.Getter;
import lombok.Setter;

@MappedSuperclass
@Getter
@Setter
public abstract class ComponantUsage {
    @Id
    private UUID id;
    private String name ;
    @ManyToOne
    private Component component ;
    private int version;
	
}
