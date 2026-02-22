package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.JpaRepository;
import bio.anode.phneutralizer.model.usage.SensorUsage;

@Repository
public interface HardwareRepository extends JpaRepository<SensorUsage<?>, UUID> {
    
}
