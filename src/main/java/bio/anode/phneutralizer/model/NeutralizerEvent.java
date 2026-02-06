package bio.anode.phneutralizer.model;

import java.time.LocalDateTime;

import bio.anode.phneutralizer.enums.Level;
import bio.anode.phneutralizer.enums.Status;

public record NeutralizerEvent(LocalDateTime timestamp, Status status,Level acidTankState) implements Event {}
