package com.vem.backend.service;

import com.vem.backend.dto.DriverDto;
import com.vem.backend.model.Driver;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.DriverRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    public DriverService(DriverRepository driverRepository, VehicleRepository vehicleRepository) {
        this.driverRepository = driverRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public DriverDto addDriver(Long userId, DriverDto dto) {
        if (!isValidContact(dto.getContact())) {
            throw new RuntimeException("Contact must be exactly 10 digits");
        }

        if (driverRepository.findByLicenseNumberAndUserId(dto.getLicenseNumber(), userId).isPresent()) {
            throw new RuntimeException("A driver with this license number already exists");
        }

        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndUserId(dto.getVehicleId(), userId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            List<Driver> existingDrivers = driverRepository.findByVehicleId(dto.getVehicleId());
            if (!existingDrivers.isEmpty()) {
                // Unassign any existing driver from this vehicle so the new driver can be added.
                for (Driver d : existingDrivers) {
                    d.setVehicle(null);
                    driverRepository.save(d);
                }
            }
        }

        Driver driver = new Driver();
    driver.setUserId(userId);
        driver.setVehicle(vehicle);
        driver.setDriverName(dto.getDriverName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setContact(dto.getContact());
        return mapToDto(driverRepository.save(driver));
    }

    public DriverDto updateDriver(Long userId, Long id, DriverDto dto) {
        if (!isValidContact(dto.getContact())) {
            throw new RuntimeException("Contact must be exactly 10 digits");
        }

        Driver driver = driverRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        if (!driver.getLicenseNumber().equals(dto.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumberAndUserId(dto.getLicenseNumber(), userId).isPresent()) {
                throw new RuntimeException("A driver with this license number already exists");
            }
        }

        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            vehicle = vehicleRepository.findByIdAndUserId(dto.getVehicleId(), userId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));

            if (driver.getVehicle() == null || !driver.getVehicle().getId().equals(dto.getVehicleId())) {
                List<Driver> existingDrivers = driverRepository.findByVehicleId(dto.getVehicleId());
                if (!existingDrivers.isEmpty()) {
                    throw new RuntimeException("This vehicle already has a driver assigned. Each vehicle can only have one driver.");
                }
            }
        }

        driver.setVehicle(vehicle);
        driver.setDriverName(dto.getDriverName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setContact(dto.getContact());
        return mapToDto(driverRepository.save(driver));
    }

    public DriverDto assignDriverToVehicle(Long userId, Long driverId, Long vehicleId) {
        Driver driver = driverRepository.findByIdAndUserId(driverId, userId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        List<Driver> existingDrivers = driverRepository.findByVehicleId(vehicleId);
        Driver currentVehicleDriver = existingDrivers.isEmpty() ? null : existingDrivers.get(0);

        boolean alreadyAssignedToThisDriver = driver.getVehicle() != null && vehicleId.equals(driver.getVehicle().getId());
        if (!alreadyAssignedToThisDriver && currentVehicleDriver != null) {
            currentVehicleDriver.setVehicle(null);
            driverRepository.save(currentVehicleDriver);
        }

        driver.setVehicle(vehicle);
        return mapToDto(driverRepository.save(driver));
    }

    public void deleteDriver(Long userId, Long id) {
        Driver driver = driverRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driverRepository.delete(driver);
    }

    public List<DriverDto> getByVehicle(Long userId, Long vehicleId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        return driverRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public List<DriverDto> getAllDrivers(Long userId) {
        return driverRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private boolean isValidContact(String contact) {
        return contact != null && contact.matches("^\\d{10}$");
    }

    private DriverDto mapToDto(Driver d) {
        DriverDto dto = new DriverDto();
        dto.setId(d.getId());
        dto.setVehicleId(d.getVehicle() != null ? d.getVehicle().getId() : null);
        dto.setDriverName(d.getDriverName());
        dto.setLicenseNumber(d.getLicenseNumber());
        dto.setContact(d.getContact());
        return dto;
    }
}
