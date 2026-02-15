package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import bio.anode.phneutralizer.model.Model;

@Repository
public interface ModelRepository extends JpaRepository<Model, UUID> {
}
