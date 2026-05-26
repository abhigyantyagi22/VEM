package com.vem.backend.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "documents")
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    private LocalDate insuranceExpiry;
    private LocalDate pucExpiry;
    private LocalDate registrationExpiry;

    public Document() {
    }

    public Document(Long id, Vehicle vehicle, LocalDate insuranceExpiry, LocalDate pucExpiry, LocalDate registrationExpiry) {
        this.id = id;
        this.vehicle = vehicle;
        this.insuranceExpiry = insuranceExpiry;
        this.pucExpiry = pucExpiry;
        this.registrationExpiry = registrationExpiry;
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

    public LocalDate getInsuranceExpiry() {
        return insuranceExpiry;
    }

    public void setInsuranceExpiry(LocalDate insuranceExpiry) {
        this.insuranceExpiry = insuranceExpiry;
    }

    public LocalDate getPucExpiry() {
        return pucExpiry;
    }

    public void setPucExpiry(LocalDate pucExpiry) {
        this.pucExpiry = pucExpiry;
    }

    public LocalDate getRegistrationExpiry() {
        return registrationExpiry;
    }

    public void setRegistrationExpiry(LocalDate registrationExpiry) {
        this.registrationExpiry = registrationExpiry;
    }

}
