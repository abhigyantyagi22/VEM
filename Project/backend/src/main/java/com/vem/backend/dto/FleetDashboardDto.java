package com.vem.backend.dto;

import java.util.List;

public class FleetDashboardDto {
    private int totalVehicles;
    private Double totalFleetExpense;
    private Double totalFuelCost;
    private Double totalMaintenanceCost;
    private List<VehicleExpenseDto> vehicleExpenses;
    private List<String> upcomingAlerts;

    public FleetDashboardDto() {}

    public int getTotalVehicles() { return totalVehicles; }
    public void setTotalVehicles(int totalVehicles) { this.totalVehicles = totalVehicles; }

    public Double getTotalFleetExpense() { return totalFleetExpense; }
    public void setTotalFleetExpense(Double totalFleetExpense) { this.totalFleetExpense = totalFleetExpense; }

    public Double getTotalFuelCost() { return totalFuelCost; }
    public void setTotalFuelCost(Double totalFuelCost) { this.totalFuelCost = totalFuelCost; }

    public Double getTotalMaintenanceCost() { return totalMaintenanceCost; }
    public void setTotalMaintenanceCost(Double totalMaintenanceCost) { this.totalMaintenanceCost = totalMaintenanceCost; }

    public List<VehicleExpenseDto> getVehicleExpenses() { return vehicleExpenses; }
    public void setVehicleExpenses(List<VehicleExpenseDto> vehicleExpenses) { this.vehicleExpenses = vehicleExpenses; }

    public List<String> getUpcomingAlerts() { return upcomingAlerts; }
    public void setUpcomingAlerts(List<String> upcomingAlerts) { this.upcomingAlerts = upcomingAlerts; }
}
