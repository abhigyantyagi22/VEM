package com.vem.backend.service;

import com.vem.backend.dto.MaintenanceDto;
import com.vem.backend.model.Maintenance;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.MaintenanceRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {
    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceService(MaintenanceRepository maintenanceRepository, VehicleRepository vehicleRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public MaintenanceDto addMaintenance(Long userId, MaintenanceDto dto) {
        Long vehicleId = dto.getVehicleId();
        if (vehicleId == null) {
            throw new RuntimeException("Vehicle id is required");
        }

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        Maintenance m = new Maintenance();
        m.setVehicle(vehicle);
        m.setServiceType(dto.getServiceType());
        m.setCost(dto.getCost());
        m.setDate(dto.getDate());
        m.setNextDue(dto.getNextDue());
        return mapToDto(maintenanceRepository.save(m));
    }

    public MaintenanceDto updateMaintenance(Long userId, Long id, MaintenanceDto dto) {
        if (id == null) {
            throw new RuntimeException("Maintenance id is required");
        }

        Maintenance maintenance = maintenanceRepository.findByIdAndVehicleUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found"));

        Long vehicleId = dto.getVehicleId();
        if (vehicleId != null && !vehicleId.equals(maintenance.getVehicle().getId())) {
            Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            maintenance.setVehicle(vehicle);
        }

        maintenance.setServiceType(dto.getServiceType());
        maintenance.setCost(dto.getCost());
        maintenance.setDate(dto.getDate());
        maintenance.setNextDue(dto.getNextDue());

        return mapToDto(maintenanceRepository.save(maintenance));
    }

    public List<MaintenanceDto> getByVehicle(Long userId, Long vehicleId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        return maintenanceRepository.findByVehicleIdOrderByDateDesc(vehicleId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public void deleteMaintenance(Long userId, Long id) {
        if (id == null) {
            throw new RuntimeException("Maintenance id is required");
        }

        Maintenance maintenance = maintenanceRepository.findByIdAndVehicleUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found"));

        maintenanceRepository.delete(maintenance);
    }

    private MaintenanceDto mapToDto(Maintenance m) {
        MaintenanceDto dto = new MaintenanceDto();
        dto.setId(m.getId());
        dto.setVehicleId(m.getVehicle().getId());
        dto.setServiceType(m.getServiceType());
        dto.setCost(m.getCost());
        dto.setDate(m.getDate());
        dto.setNextDue(m.getNextDue());
        return dto;
    }
}
