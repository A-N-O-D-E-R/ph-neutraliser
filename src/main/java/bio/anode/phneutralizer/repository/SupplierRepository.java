package bio.anode.phneutralizer.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import bio.anode.phneutralizer.model.Supplier;

@Repository
public interface SupplierRepository extends JpaRepository<Supplier, UUID> {
}
