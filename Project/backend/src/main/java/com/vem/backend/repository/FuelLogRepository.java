package com.vem.backend.repository;

import com.vem.backend.model.FuelLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {
    List<FuelLog> findByVehicleIdOrderByDateDesc(Long vehicleId);
    List<FuelLog> findByVehicleUserIdOrderByDateDesc(Long userId);
    Optional<FuelLog> findByIdAndVehicleUserId(Long id, Long userId);
}
