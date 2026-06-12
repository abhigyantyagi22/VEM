package com.vem.backend.controller;

import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.ReportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<byte[]> downloadVehicleReport(@AuthenticationPrincipal AuthenticatedUserDetails currentUser,
                                                        @PathVariable Long vehicleId) {
        byte[] pdf = reportService.generateVehicleReport(currentUser.getId(), vehicleId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=vehicle-report-" + vehicleId + ".pdf")
                .body(pdf);
    }
}