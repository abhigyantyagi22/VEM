package com.vem.backend.repository;

import com.vem.backend.model.Maintenance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface MaintenanceRepository extends JpaRepository<Maintenance, Long> {
    List<Maintenance> findByVehicleIdOrderByDateDesc(Long vehicleId);
    List<Maintenance> findByVehicleUserIdOrderByDateDesc(Long userId);
    Optional<Maintenance> findByIdAndVehicleUserId(Long id, Long userId);
}
