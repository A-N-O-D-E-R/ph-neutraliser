package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import bio.anode.phneutralizer.model.sensor.Sensor;

@Repository
public interface SensorRepository extends JpaRepository<Sensor, UUID> {
}
