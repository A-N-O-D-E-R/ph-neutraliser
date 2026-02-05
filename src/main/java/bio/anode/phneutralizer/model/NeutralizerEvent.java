package bio.anode.phneutralizer.model;

import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class NeutralizerEvent extends Event {
    private Status status;
    private Level acidTankState;
}
