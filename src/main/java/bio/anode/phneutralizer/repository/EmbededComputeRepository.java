package bio.anode.phneutralizer.repository;

import bio.anode.phneutralizer.model.usage.EmbededComputeUsage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface EmbededComputeRepository extends JpaRepository<EmbededComputeUsage, UUID> {
}
