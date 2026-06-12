package com.vem.backend.dto;

public class VehicleExpenseDto {
    private Long vehicleId;
    private String vehicleName;
    private String vehicleNumber;
    private Double totalExpense; // total cost of ownership (fuel + maintenance)
    private Double fuelCost;
    private Double maintenanceCost;
    private Double kmPerL;
    private Double costPerKm;

    public VehicleExpenseDto() {}

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public Double getTotalExpense() { return totalExpense; }
    public void setTotalExpense(Double totalExpense) { this.totalExpense = totalExpense; }

    public Double getFuelCost() { return fuelCost; }
    public void setFuelCost(Double fuelCost) { this.fuelCost = fuelCost; }

    public Double getMaintenanceCost() { return maintenanceCost; }
    public void setMaintenanceCost(Double maintenanceCost) { this.maintenanceCost = maintenanceCost; }

    public Double getKmPerL() { return kmPerL; }
    public void setKmPerL(Double kmPerL) { this.kmPerL = kmPerL; }

    public Double getCostPerKm() { return costPerKm; }
    public void setCostPerKm(Double costPerKm) { this.costPerKm = costPerKm; }
}