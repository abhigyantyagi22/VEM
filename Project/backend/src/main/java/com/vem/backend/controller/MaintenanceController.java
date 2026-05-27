package com.vem.backend.controller;

import com.vem.backend.dto.MaintenanceDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ResponseEntity<MaintenanceDto> addMaintenance(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestBody MaintenanceDto dto) {
        return ResponseEntity.ok(maintenanceService.addMaintenance(currentUser.getId(), dto));
    }

    @GetMapping
    public ResponseEntity<List<MaintenanceDto>> getMaintenanceLogs(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestParam Long vehicleId) {
        return ResponseEntity.ok(maintenanceService.getByVehicle(currentUser.getId(), vehicleId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaintenanceDto> updateMaintenance(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody MaintenanceDto dto) {
        return ResponseEntity.ok(maintenanceService.updateMaintenance(currentUser.getId(), id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaintenance(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id) {
        maintenanceService.deleteMaintenance(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}