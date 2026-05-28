package com.vem.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "fuel_logs")
public class FuelLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    private Double fuelAmount;
    private Double fuelCost;
    @Column(name = "odometer")
    private Long distanceDriven;
    private LocalDate date;

    public FuelLog() {
    }

    public FuelLog(Long id, Vehicle vehicle, Double fuelAmount, Double fuelCost, Long distanceDriven, LocalDate date) {
        this.id = id;
        this.vehicle = vehicle;
        this.fuelAmount = fuelAmount;
        this.fuelCost = fuelCost;
        this.distanceDriven = distanceDriven;
        this.date = date;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
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

    public Long getDistanceDriven() {
        return distanceDriven;
    }

    public void setDistanceDriven(Long distanceDriven) {
        this.distanceDriven = distanceDriven;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

}
