package com.vem.backend.repository;

import com.vem.backend.model.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByVehicleIdOrderByIdDesc(Long vehicleId);
    Optional<Document> findTopByVehicleIdOrderByIdDesc(Long vehicleId);
}
