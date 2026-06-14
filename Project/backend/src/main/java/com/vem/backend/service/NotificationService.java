package com.vem.backend.service;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private static final int NOTIFICATION_WINDOW_DAYS = 7;

    private final AlertService alertService;

    public NotificationService(AlertService alertService) {
        this.alertService = alertService;
    }

    public List<String> getNotifications(Long userId) {
        return alertService.getAlertMessages(userId, NOTIFICATION_WINDOW_DAYS);
    }
}