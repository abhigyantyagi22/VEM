package com.vem.backend.controller;

import com.vem.backend.dto.VehicleDto;
import com.vem.backend.service.VehicleService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<List<VehicleDto>> getVehicles(@RequestParam Long userId) {
        return ResponseEntity.ok(vehicleService.getUserVehicles(userId));
    }

    @PostMapping
    public ResponseEntity<VehicleDto> addVehicle(@RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.addVehicle(dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDto> updateVehicle(@PathVariable Long id, @RequestBody VehicleDto dto) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, dto));
    }
}