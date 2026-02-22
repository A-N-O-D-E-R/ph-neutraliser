package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import bio.anode.phneutralizer.model.usage.ClockRTCComponentUsage;

@Repository
public interface ClockRTCRepository extends JpaRepository<ClockRTCComponentUsage, UUID> {

}
