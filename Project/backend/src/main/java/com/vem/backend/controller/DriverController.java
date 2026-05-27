package com.vem.backend.controller;

import com.vem.backend.dto.DriverDto;
import com.vem.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/drivers")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    public ResponseEntity<DriverDto> addDriver(@RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.addDriver(dto));
    }

    @GetMapping
    public ResponseEntity<List<DriverDto>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDto> updateDriver(@PathVariable Long id, @RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.updateDriver(id, dto));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<DriverDto> assignDriver(@PathVariable Long id, @RequestBody DriverDto dto) {

        if (dto.getVehicleId() == null) {
            throw new RuntimeException("Vehicle not found");
        }

        return ResponseEntity.ok(
                driverService.assignDriverToVehicle(id, dto.getVehicleId())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@PathVariable Long id) {
        driverService.deleteDriver(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<List<DriverDto>> getDrivers(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(driverService.getByVehicle(vehicleId));
    }
}