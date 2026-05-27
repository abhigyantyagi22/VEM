package com.vem.backend.service;

import com.vem.backend.dto.FuelLogDto;
import com.vem.backend.model.FuelLog;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.FuelLogRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuelLogService {
    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;

    public FuelLogService(FuelLogRepository fuelLogRepository, VehicleRepository vehicleRepository) {
        this.fuelLogRepository = fuelLogRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public FuelLogDto addFuelLog(Long userId, FuelLogDto dto) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(dto.getVehicleId(), userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));
        FuelLog log = new FuelLog();
        log.setVehicle(vehicle);
        log.setFuelAmount(dto.getFuelAmount());
        log.setFuelCost(dto.getFuelCost());
        log.setOdometer(dto.getOdometer());
        log.setDate(dto.getDate());
        return mapToDto(fuelLogRepository.save(log));
    }

    public FuelLogDto updateFuelLog(Long userId, Long id, FuelLogDto dto) {
        FuelLog existingLog = fuelLogRepository.findByIdAndVehicleUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Fuel log not found"));

        Vehicle vehicle = vehicleRepository.findByIdAndUserId(dto.getVehicleId(), userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        existingLog.setVehicle(vehicle);
        existingLog.setFuelAmount(dto.getFuelAmount());
        existingLog.setFuelCost(dto.getFuelCost());
        existingLog.setOdometer(dto.getOdometer());
        existingLog.setDate(dto.getDate());

        return mapToDto(fuelLogRepository.save(existingLog));
    }

    public List<FuelLogDto> getByVehicle(Long userId, Long vehicleId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        return fuelLogRepository.findByVehicleIdOrderByDateDesc(vehicleId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public void deleteFuelLog(Long userId, Long id) {
        FuelLog fuelLog = fuelLogRepository.findByIdAndVehicleUserId(id, userId)
                .orElseThrow(() -> new RuntimeException("Fuel log not found"));
        fuelLogRepository.delete(fuelLog);
    }

    private FuelLogDto mapToDto(FuelLog log) {
        FuelLogDto dto = new FuelLogDto();
        dto.setId(log.getId());
        dto.setVehicleId(log.getVehicle().getId());
        dto.setFuelAmount(log.getFuelAmount());
        dto.setFuelCost(log.getFuelCost());
        dto.setOdometer(log.getOdometer());
        dto.setDate(log.getDate());
        return dto;
    }
}
