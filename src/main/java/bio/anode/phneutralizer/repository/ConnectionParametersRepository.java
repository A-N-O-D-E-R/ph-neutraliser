package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import bio.anode.phneutralizer.model.connection.ConnectionParameters;

@Repository
public interface ConnectionParametersRepository extends JpaRepository<ConnectionParameters, UUID> {
}
