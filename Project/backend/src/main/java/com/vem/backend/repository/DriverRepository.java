package com.vem.backend.repository;

import com.vem.backend.model.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    List<Driver> findByVehicleId(Long vehicleId);
    List<Driver> findByUserId(Long userId);
    Optional<Driver> findByIdAndUserId(Long id, Long userId);
    Optional<Driver> findByLicenseNumberAndUserId(String licenseNumber, Long userId);
}
