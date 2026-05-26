package com.vem.backend.dto;

import java.util.Map;

public class DashboardDto {
    private Long vehicleId;
    private Double totalExpense;
    private Double totalFuelCost;
    private Double totalMaintenanceCost;
    private Double mileage; // km per liter
    private Double costPerKm;
    private Map<String, Double> monthlyExpenses;

    public DashboardDto() {
    }

    public DashboardDto(Long vehicleId, Double totalExpense, Double totalFuelCost, Double totalMaintenanceCost, Double mileage, Double costPerKm, Map<String, Double> monthlyExpenses) {
        this.vehicleId = vehicleId;
        this.totalExpense = totalExpense;
        this.totalFuelCost = totalFuelCost;
        this.totalMaintenanceCost = totalMaintenanceCost;
        this.mileage = mileage;
        this.costPerKm = costPerKm;
        this.monthlyExpenses = monthlyExpenses;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Double getTotalExpense() {
        return totalExpense;
    }

    public void setTotalExpense(Double totalExpense) {
        this.totalExpense = totalExpense;
    }

    public Double getTotalFuelCost() {
        return totalFuelCost;
    }

    public void setTotalFuelCost(Double totalFuelCost) {
        this.totalFuelCost = totalFuelCost;
    }

    public Double getTotalMaintenanceCost() {
        return totalMaintenanceCost;
    }

    public void setTotalMaintenanceCost(Double totalMaintenanceCost) {
        this.totalMaintenanceCost = totalMaintenanceCost;
    }

    public Double getMileage() {
        return mileage;
    }

    public void setMileage(Double mileage) {
        this.mileage = mileage;
    }

    public Double getCostPerKm() {
        return costPerKm;
    }

    public void setCostPerKm(Double costPerKm) {
        this.costPerKm = costPerKm;
    }

    public Map<String, Double> getMonthlyExpenses() {
        return monthlyExpenses;
    }

    public void setMonthlyExpenses(Map<String, Double> monthlyExpenses) {
        this.monthlyExpenses = monthlyExpenses;
    }

}
