package com.vem.backend.controller;

import com.vem.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<String>> getNotifications(@AuthenticationPrincipal com.vem.backend.service.AuthenticatedUserDetails currentUser, @PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotifications(currentUser.getId()));
    }
}