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

    public DriverDto addDriver(DriverDto dto) {
        // Validate contact must be exactly 10 digits
        if (!isValidContact(dto.getContact())) {
            throw new RuntimeException("Contact must be exactly 10 digits");
        }
        
        // Check if license number already exists
        if (driverRepository.findByLicenseNumber(dto.getLicenseNumber()).isPresent()) {
            throw new RuntimeException("A driver with this license number already exists");
        }

        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            // Check if vehicle already has a driver assigned
            List<Driver> existingDrivers = driverRepository.findByVehicleId(dto.getVehicleId());
            if (!existingDrivers.isEmpty()) {
                throw new RuntimeException("This vehicle already has a driver assigned. Each vehicle can only have one driver.");
            }

            vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        }
        Driver driver = new Driver();
        driver.setVehicle(vehicle);
        driver.setDriverName(dto.getDriverName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setContact(dto.getContact());
        return mapToDto(driverRepository.save(driver));
    }

    public DriverDto updateDriver(Long id, DriverDto dto) {
        // Validate contact must be exactly 10 digits
        if (!isValidContact(dto.getContact())) {
            throw new RuntimeException("Contact must be exactly 10 digits");
        }
        
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        
        // Check if license number already exists (and it's not the same driver)
        if (!driver.getLicenseNumber().equals(dto.getLicenseNumber())) {
            if (driverRepository.findByLicenseNumber(dto.getLicenseNumber()).isPresent()) {
                throw new RuntimeException("A driver with this license number already exists");
            }
        }
        

        Vehicle vehicle = null;
        if (dto.getVehicleId() != null) {
            // Check if changing vehicle: if new vehicle already has a driver, reject
            if (driver.getVehicle() == null || !driver.getVehicle().getId().equals(dto.getVehicleId())) {
                List<Driver> existingDrivers = driverRepository.findByVehicleId(dto.getVehicleId());
                if (!existingDrivers.isEmpty()) {
                    throw new RuntimeException("This vehicle already has a driver assigned. Each vehicle can only have one driver.");
                }
            }

            vehicle = vehicleRepository.findById(dto.getVehicleId())
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        }
        
        driver.setVehicle(vehicle);
        driver.setDriverName(dto.getDriverName());
        driver.setLicenseNumber(dto.getLicenseNumber());
        driver.setContact(dto.getContact());
        return mapToDto(driverRepository.save(driver));
    }

    public DriverDto assignDriverToVehicle(Long driverId, Long vehicleId) {
        Driver driver = driverRepository.findById(driverId)
                .orElseThrow(() -> new RuntimeException("Driver not found"));

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
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

    public void deleteDriver(Long id) {
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Driver not found"));
        driverRepository.delete(driver);
    }

    public List<DriverDto> getByVehicle(Long vehicleId) {
        return driverRepository.findByVehicleId(vehicleId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<DriverDto> getAllDrivers() {
        return driverRepository.findAll().stream()
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
