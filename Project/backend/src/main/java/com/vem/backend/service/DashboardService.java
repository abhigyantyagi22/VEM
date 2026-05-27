package com.vem.backend.service;

import com.vem.backend.dto.DashboardDto;
import com.vem.backend.model.FuelLog;
import com.vem.backend.model.Maintenance;
import com.vem.backend.repository.VehicleRepository;
import com.vem.backend.repository.FuelLogRepository;
import com.vem.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
public class DashboardService {

    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final VehicleRepository vehicleRepository;

    public DashboardService(FuelLogRepository fuelLogRepository, MaintenanceRepository maintenanceRepository, VehicleRepository vehicleRepository) {
        this.fuelLogRepository = fuelLogRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public DashboardDto getDashboardData(Long userId, Long vehicleId) {
        vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        List<FuelLog> fuelLogs = fuelLogRepository.findByVehicleIdOrderByDateDesc(vehicleId).stream()
                .filter(log -> log.getVehicle() != null && log.getVehicle().getUser() != null && userId.equals(log.getVehicle().getUser().getId()))
                .toList();
        List<Maintenance> maintenanceLogs = maintenanceRepository.findByVehicleIdOrderByDateDesc(vehicleId).stream()
                .filter(log -> log.getVehicle() != null && log.getVehicle().getUser() != null && userId.equals(log.getVehicle().getUser().getId()))
                .toList();

        DashboardDto dto = new DashboardDto();
        dto.setVehicleId(vehicleId);

        // Sum up costs
        double totalFuelCost = fuelLogs.stream()
                .filter(log -> log.getFuelCost() != null)
                .mapToDouble(FuelLog::getFuelCost)
                .sum();
        
        double totalMaintCost = maintenanceLogs.stream()
                .filter(log -> log.getCost() != null)
                .mapToDouble(Maintenance::getCost)
                .sum();

        dto.setTotalFuelCost(totalFuelCost);
        dto.setTotalMaintenanceCost(totalMaintCost);
        dto.setTotalExpense(totalFuelCost + totalMaintCost);

        // Mileage & Cost per Km using per-log distance (stored in odometer for compatibility)
        double mileage = 0.0;
        double costPerKm = 0.0;
        if (!fuelLogs.isEmpty()) {
            long distance = fuelLogs.stream()
                .filter(log -> log.getOdometer() != null && log.getOdometer() > 0)
                .mapToLong(FuelLog::getOdometer)
                .sum();

            double totalFuelAdded = fuelLogs.stream()
                    .filter(log -> log.getFuelAmount() != null)
                    .mapToDouble(FuelLog::getFuelAmount)
                    .sum();

            if (totalFuelAdded > 0 && distance > 0) {
                mileage = distance / totalFuelAdded;
            }
            if (distance > 0) {
                costPerKm = totalFuelCost / distance;
            }
        }
        
        dto.setMileage(Math.round(mileage * 100.0) / 100.0);
        dto.setCostPerKm(Math.round(costPerKm * 100.0) / 100.0);

        // Monthly Expenses chart logic
        Map<String, Double> monthlyExpenses = new HashMap<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM");
        
        for (FuelLog log : fuelLogs) {
            if (log.getDate() != null && log.getFuelCost() != null) {
                String month = log.getDate().format(formatter);
                monthlyExpenses.put(month, monthlyExpenses.getOrDefault(month, 0.0) + log.getFuelCost());
            }
        }
        for (Maintenance m : maintenanceLogs) {
            if (m.getDate() != null && m.getCost() != null) {
                String month = m.getDate().format(formatter);
                monthlyExpenses.put(month, monthlyExpenses.getOrDefault(month, 0.0) + m.getCost());
            }
        }
        
        dto.setMonthlyExpenses(monthlyExpenses);

        return dto;
    }
}
