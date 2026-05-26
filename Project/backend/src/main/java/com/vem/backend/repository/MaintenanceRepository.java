package com.vem.backend.repository;

import com.vem.backend.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicleIdOrderByDateDesc(Long vehicleId);
}
