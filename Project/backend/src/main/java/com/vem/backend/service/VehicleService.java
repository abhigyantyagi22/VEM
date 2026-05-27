package com.vem.backend.service;

import com.vem.backend.dto.VehicleDto;
import com.vem.backend.model.User;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.UserRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public VehicleService(VehicleRepository vehicleRepository, UserRepository userRepository) {
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    public List<VehicleDto> getUserVehicles(Long userId) {
        return vehicleRepository.findByUserId(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public VehicleDto addVehicle(Long userId, VehicleDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(user);
        vehicle.setVehicleName(dto.getVehicleName());
        vehicle.setVehicleNumber(dto.getVehicleNumber());
        vehicle.setVehicleType(dto.getVehicleType());
        vehicle.setPurchaseDate(dto.getPurchaseDate());

        return mapToDto(vehicleRepository.save(vehicle));
    }

    public void deleteVehicle(Long id, Long userId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        vehicleRepository.delete(vehicle);
    }

    public VehicleDto updateVehicle(Long id, Long userId, VehicleDto dto) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Only update editable fields
        if (dto.getVehicleName() != null) vehicle.setVehicleName(dto.getVehicleName());
        if (dto.getVehicleNumber() != null) vehicle.setVehicleNumber(dto.getVehicleNumber());
        if (dto.getVehicleType() != null) vehicle.setVehicleType(dto.getVehicleType());
        if (dto.getPurchaseDate() != null) vehicle.setPurchaseDate(dto.getPurchaseDate());

        return mapToDto(vehicleRepository.save(vehicle));
    }

    private VehicleDto mapToDto(Vehicle vehicle) {
        VehicleDto dto = new VehicleDto();
        dto.setId(vehicle.getId());
        dto.setUserId(vehicle.getUser().getId());
        dto.setVehicleName(vehicle.getVehicleName());
        dto.setVehicleNumber(vehicle.getVehicleNumber());
        dto.setVehicleType(vehicle.getVehicleType());
        dto.setPurchaseDate(vehicle.getPurchaseDate());
        return dto;
    }
}
