package com.vem.backend.controller;

import com.vem.backend.dto.FuelLogDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.FuelLogService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class FuelLogController {

    private final FuelLogService fuelLogService;

    public FuelLogController(FuelLogService fuelLogService) {
        this.fuelLogService = fuelLogService;
    }

    @PostMapping
    public ResponseEntity<FuelLogDto> addFuel(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestBody FuelLogDto dto) {
        return ResponseEntity.ok(fuelLogService.addFuelLog(currentUser.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelLogDto> updateFuel(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody FuelLogDto dto) {
        return ResponseEntity.ok(fuelLogService.updateFuelLog(currentUser.getId(), id, dto));
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<List<FuelLogDto>> getFuelLogs(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelLogService.getByVehicle(currentUser.getId(), vehicleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelLog(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id) {
        fuelLogService.deleteFuelLog(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}