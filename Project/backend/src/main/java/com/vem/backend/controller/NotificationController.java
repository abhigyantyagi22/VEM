package com.vem.backend.controller;

import com.vem.backend.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")

public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<List<String>> getNotifications(@AuthenticationPrincipal com.vem.backend.service.AuthenticatedUserDetails currentUser) {
        return ResponseEntity.ok(notificationService.getNotifications(currentUser.getId()));
    }
}