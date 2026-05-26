package com.vem.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    private String serviceType;
    private Double cost;
    private LocalDate date;
    private LocalDate nextDue;

    public Maintenance() {
    }

    public Maintenance(Long id, Vehicle vehicle, String serviceType, Double cost, LocalDate date, LocalDate nextDue) {
        this.id = id;
        this.vehicle = vehicle;
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

    public Vehicle getVehicle() {
        return vehicle;
    }

    public void setVehicle(Vehicle vehicle) {
        this.vehicle = vehicle;
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
