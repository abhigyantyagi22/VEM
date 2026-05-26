package com.vem.backend.controller;

import com.vem.backend.dto.MaintenanceDto;
import com.vem.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
@CrossOrigin(origins = "*")
public class MaintenanceController {
    
    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceDto> addMaintenance(@RequestBody MaintenanceDto dto) {
        return ResponseEntity.ok(maintenanceService.addMaintenance(dto));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceDto>> getMaintenanceLogs(@RequestParam Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getByVehicle(vehicleId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceDto> updateMaintenance(@PathVariable Long id, @RequestBody MaintenanceDto dto) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@PathVariable Long id) {
        maintenanceService.deleteMaintenance(id);
        return ResponseEntity.noContent().build();
    }
}
