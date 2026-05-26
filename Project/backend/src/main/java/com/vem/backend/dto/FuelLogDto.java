package com.vem.backend.dto;

import java.time.LocalDate;

public class FuelLogDto {
    private Long id;
    private Long vehicleId;
    private Double fuelAmount;
    private Double fuelCost;
    private Long odometer;
    private LocalDate date;

    public FuelLogDto() {
    }

    public FuelLogDto(Long id, Long vehicleId, Double fuelAmount, Double fuelCost, Long odometer, LocalDate date) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.fuelAmount = fuelAmount;
        this.fuelCost = fuelCost;
        this.odometer = odometer;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
    }

    public Double getFuelAmount() {
        return fuelAmount;
    }

    public void setFuelAmount(Double fuelAmount) {
        this.fuelAmount = fuelAmount;
    }

    public Double getFuelCost() {
        return fuelCost;
    }

    public void setFuelCost(Double fuelCost) {
        this.fuelCost = fuelCost;
    }

    public Long getOdometer() {
        return odometer;
    }

    public void setOdometer(Long odometer) {
        this.odometer = odometer;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

}
