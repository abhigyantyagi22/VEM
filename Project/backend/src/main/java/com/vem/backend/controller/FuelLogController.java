package com.vem.backend.controller;

import com.vem.backend.dto.FuelLogDto;
import com.vem.backend.service.FuelLogService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<FuelLogDto> addFuel(@RequestBody FuelLogDto dto) {
        return ResponseEntity.ok(fuelLogService.addFuelLog(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FuelLogDto> updateFuel(@PathVariable Long id, @RequestBody FuelLogDto dto) {
        return ResponseEntity.ok(fuelLogService.updateFuelLog(id, dto));
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<List<FuelLogDto>> getFuelLogs(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(fuelLogService.getByVehicle(vehicleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFuelLog(@PathVariable Long id) {
        fuelLogService.deleteFuelLog(id);
        return ResponseEntity.noContent().build();
    }
}