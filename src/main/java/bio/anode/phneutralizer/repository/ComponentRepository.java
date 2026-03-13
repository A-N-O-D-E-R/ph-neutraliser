package bio.anode.phneutralizer.repository;

import bio.anode.phneutralizer.model.component.Component;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ComponentRepository extends JpaRepository<Component, UUID> {
}
