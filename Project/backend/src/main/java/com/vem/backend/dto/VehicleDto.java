package com.vem.backend.dto;

import java.time.LocalDate;

public class VehicleDto {
    private Long id;
    private Long userId; // The ID of the owner
    private String vehicleName;
    private String vehicleNumber;
    private String vehicleType;
    private LocalDate purchaseDate;

    public VehicleDto() {
    }

    public VehicleDto(Long id, Long userId, String vehicleName, String vehicleNumber, String vehicleType, LocalDate purchaseDate) {
        this.id = id;
        this.userId = userId;
        this.vehicleName = vehicleName;
        this.vehicleNumber = vehicleNumber;
        this.vehicleType = vehicleType;
        this.purchaseDate = purchaseDate;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getVehicleName() {
        return vehicleName;
    }

    public void setVehicleName(String vehicleName) {
        this.vehicleName = vehicleName;
    }

    public String getVehicleNumber() {
        return vehicleNumber;
    }

    public void setVehicleNumber(String vehicleNumber) {
        this.vehicleNumber = vehicleNumber;
    }

    public String getVehicleType() {
        return vehicleType;
    }

    public void setVehicleType(String vehicleType) {
        this.vehicleType = vehicleType;
    }

    public LocalDate getPurchaseDate() {
        return purchaseDate;
    }

    public void setPurchaseDate(LocalDate purchaseDate) {
        this.purchaseDate = purchaseDate;
    }

}
