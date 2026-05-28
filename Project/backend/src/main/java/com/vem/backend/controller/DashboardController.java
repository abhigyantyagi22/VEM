package com.vem.backend.controller;

import com.vem.backend.dto.DashboardDto;
import com.vem.backend.dto.FleetDashboardDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
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

    @GetMapping("/fleet")
    public ResponseEntity<FleetDashboardDto> getFleetDashboard(@AuthenticationPrincipal AuthenticatedUserDetails currentUser) {
        return ResponseEntity.ok(dashboardService.getFleetDashboardData(currentUser.getId()));
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<DashboardDto> getDashboardData(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long vehicleId) {
        return ResponseEntity.ok(dashboardService.getDashboardData(currentUser.getId(), vehicleId));
    }
}