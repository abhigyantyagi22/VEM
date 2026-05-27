package com.vem.backend.controller;

import com.vem.backend.dto.DashboardDto;
import com.vem.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<DashboardDto> getDashboardData(@PathVariable Long vehicleId) {
        return ResponseEntity.ok(dashboardService.getDashboardData(vehicleId));
    }
}