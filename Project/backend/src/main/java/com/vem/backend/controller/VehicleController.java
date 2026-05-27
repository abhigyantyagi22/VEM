package com.vem.backend.controller;

import com.vem.backend.dto.VehicleDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.VehicleService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    // Assuming user id is passed via param until JWT is setup
    @GetMapping
    public ResponseEntity<List<VehicleDto>> getVehicles(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestParam(required = false) Long userId) {
        return ResponseEntity.ok(vehicleService.getUserVehicles(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<VehicleDto> addVehicle(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.addVehicle(currentUser.getId(), dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id) {
        vehicleService.deleteVehicle(id, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, currentUser.getId(), dto));
    }
}