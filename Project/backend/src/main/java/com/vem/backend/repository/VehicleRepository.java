package com.vem.backend.repository;

import com.vem.backend.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByUserId(Long userId);
    Optional<Vehicle> findByIdAndUserId(Long id, Long userId);
}
