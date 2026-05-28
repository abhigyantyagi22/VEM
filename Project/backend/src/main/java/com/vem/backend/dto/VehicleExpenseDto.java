package com.vem.backend.dto;

public class VehicleExpenseDto {
    private Long vehicleId;
    private String vehicleName;
    private String vehicleNumber;
    private Double totalExpense;

    public VehicleExpenseDto() {}

    public Long getVehicleId() { return vehicleId; }
    public void setVehicleId(Long vehicleId) { this.vehicleId = vehicleId; }

    public String getVehicleName() { return vehicleName; }
    public void setVehicleName(String vehicleName) { this.vehicleName = vehicleName; }

    public String getVehicleNumber() { return vehicleNumber; }
    public void setVehicleNumber(String vehicleNumber) { this.vehicleNumber = vehicleNumber; }

    public Double getTotalExpense() { return totalExpense; }
    public void setTotalExpense(Double totalExpense) { this.totalExpense = totalExpense; }
}
