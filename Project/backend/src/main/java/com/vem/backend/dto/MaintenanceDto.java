package com.vem.backend.dto;

import java.time.LocalDate;

public class MaintenanceDto {
    private Long id;
    private Long vehicleId;
    private String serviceType;
    private Double cost;
    private LocalDate date;
    private LocalDate nextDue;

    public MaintenanceDto() {
    }

    public MaintenanceDto(Long id, Long vehicleId, String serviceType, Double cost, LocalDate date, LocalDate nextDue) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.serviceType = serviceType;
        this.cost = cost;
        this.date = date;
        this.nextDue = nextDue;
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

    public String getServiceType() {
        return serviceType;
    }

    public void setServiceType(String serviceType) {
        this.serviceType = serviceType;
    }

    public Double getCost() {
        return cost;
    }

    public void setCost(Double cost) {
        this.cost = cost;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate getNextDue() {
        return nextDue;
    }

    public void setNextDue(LocalDate nextDue) {
        this.nextDue = nextDue;
    }

}
