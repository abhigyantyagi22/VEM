package com.vem.backend.controller;

import com.vem.backend.dto.DriverDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.DriverService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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
    public ResponseEntity<DriverDto> addDriver(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.addDriver(currentUser.getId(), dto));
    }

    @GetMapping
    public ResponseEntity<List<DriverDto>> getAllDrivers(@AuthenticationPrincipal AuthenticatedUserDetails currentUser) {
        return ResponseEntity.ok(driverService.getAllDrivers(currentUser.getId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DriverDto> updateDriver(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody DriverDto dto) {
        return ResponseEntity.ok(driverService.updateDriver(currentUser.getId(), id, dto));
    }

    @PutMapping("/{id}/assign")
    public ResponseEntity<DriverDto> assignDriver(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody DriverDto dto) {

        if (dto.getVehicleId() == null) {
            throw new RuntimeException("Vehicle not found");
        }

        return ResponseEntity.ok(
                driverService.assignDriverToVehicle(currentUser.getId(), id, dto.getVehicleId())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDriver(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id) {
        driverService.deleteDriver(currentUser.getId(), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<List<DriverDto>> getDrivers(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long vehicleId) {
        return ResponseEntity.ok(driverService.getByVehicle(currentUser.getId(), vehicleId));
    }
}