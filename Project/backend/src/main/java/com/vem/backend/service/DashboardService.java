package com.vem.backend.service;

import com.vem.backend.dto.DashboardDto;
import com.vem.backend.dto.FleetDashboardDto;
import com.vem.backend.dto.VehicleExpenseDto;
import com.vem.backend.model.FuelLog;
import com.vem.backend.model.Maintenance;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.VehicleRepository;
import com.vem.backend.repository.FuelLogRepository;
import com.vem.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
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

    public FleetDashboardDto getFleetDashboardData(Long userId) {
        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        List<FuelLog> allFuelLogs = fuelLogRepository.findByVehicleUserIdOrderByDateDesc(userId);
        List<Maintenance> allMaintLogs = maintenanceRepository.findByVehicleUserIdOrderByDateDesc(userId);

        double totalFuelCost = allFuelLogs.stream()
                .filter(l -> l.getFuelCost() != null)
                .mapToDouble(FuelLog::getFuelCost).sum();
        double totalMaintCost = allMaintLogs.stream()
                .filter(m -> m.getCost() != null)
                .mapToDouble(Maintenance::getCost).sum();

        Map<Long, Double> expenseByVehicle = new HashMap<>();
        for (FuelLog l : allFuelLogs) {
            if (l.getFuelCost() != null && l.getVehicle() != null) {
                expenseByVehicle.merge(l.getVehicle().getId(), l.getFuelCost(), Double::sum);
            }
        }
        for (Maintenance m : allMaintLogs) {
            if (m.getCost() != null && m.getVehicle() != null) {
                expenseByVehicle.merge(m.getVehicle().getId(), m.getCost(), Double::sum);
            }
        }

        List<VehicleExpenseDto> vehicleExpenses = vehicles.stream().map(v -> {
            VehicleExpenseDto d = new VehicleExpenseDto();
            d.setVehicleId(v.getId());
            d.setVehicleName(v.getVehicleName());
            d.setVehicleNumber(v.getVehicleNumber());
            d.setTotalExpense(expenseByVehicle.getOrDefault(v.getId(), 0.0));
            return d;
        }).sorted((a, b) -> Double.compare(b.getTotalExpense(), a.getTotalExpense()))
                .collect(java.util.stream.Collectors.toList());

        LocalDate today = LocalDate.now();
        List<String> alerts = new ArrayList<>();
        for (Vehicle v : vehicles) {
            allMaintLogs.stream()
                    .filter(m -> m.getVehicle() != null && m.getVehicle().getId().equals(v.getId()))
                    .findFirst()
                    .ifPresent(latest -> {
                        if (latest.getNextDue() == null) return;
                        long days = ChronoUnit.DAYS.between(today, latest.getNextDue());
                        if (days < 0) {
                            alerts.add(v.getVehicleName() + ": Service OVERDUE (" + latest.getServiceType() + ")");
                        } else if (days <= 30) {
                            alerts.add(v.getVehicleName() + ": Service due in " + days + " day" + (days == 1 ? "" : "s") + " (" + latest.getServiceType() + ")");
                        }
                    });
        }

        FleetDashboardDto dto = new FleetDashboardDto();
        dto.setTotalVehicles(vehicles.size());
        dto.setTotalFuelCost(totalFuelCost);
        dto.setTotalMaintenanceCost(totalMaintCost);
        dto.setTotalFleetExpense(totalFuelCost + totalMaintCost);
        dto.setVehicleExpenses(vehicleExpenses);
        dto.setUpcomingAlerts(alerts);
        return dto;
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
                .filter(log -> log.getDistanceDriven() != null && log.getDistanceDriven() > 0)
                .mapToLong(FuelLog::getDistanceDriven)
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
