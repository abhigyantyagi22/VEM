package com.vem.backend.dto;


public class DriverDto {
    private Long id;
    private Long vehicleId;
    private String driverName;
    private String licenseNumber;
    private String contact;

    public DriverDto() {
    }

    public DriverDto(Long id, Long vehicleId, String driverName, String licenseNumber, String contact) {
        this.id = id;
        this.vehicleId = vehicleId;
        this.driverName = driverName;
        this.licenseNumber = licenseNumber;
        this.contact = contact;
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

    public String getDriverName() {
        return driverName;
    }

    public void setDriverName(String driverName) {
        this.driverName = driverName;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
    }

}
