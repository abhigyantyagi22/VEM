package com.vem.backend.dto;

import java.time.LocalDate;

public class DocumentDto {
    private Long id;
    private Long vehicleId;
    private LocalDate insuranceExpiry;
    private LocalDate pucExpiry;
    private LocalDate registrationExpiry;

    public DocumentDto() {
    }

    public DocumentDto(Long id, Long vehicleId, LocalDate insuranceExpiry, LocalDate pucExpiry, LocalDate registrationExpiry) {
        this.id = id;
        this.vehicleId = vehicleId;
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

    public Long getVehicleId() {
        return vehicleId;
    }

    public void setVehicleId(Long vehicleId) {
        this.vehicleId = vehicleId;
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
