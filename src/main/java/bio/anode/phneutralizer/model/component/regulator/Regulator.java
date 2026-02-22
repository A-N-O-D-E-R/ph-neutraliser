package bio.anode.phneutralizer.model.component.regulator;

import bio.anode.phneutralizer.model.component.NetworkingComponent;
import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@DiscriminatorValue("REGULATOR")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Regulator extends NetworkingComponent{
	
	private String unite;
	private Double minimum;
	private Double maximum;
	private boolean analog; 
	private Double correctionFactor;

}
