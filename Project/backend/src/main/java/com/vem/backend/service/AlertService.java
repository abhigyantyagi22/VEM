package com.vem.backend.service;

import com.vem.backend.model.Document;
import com.vem.backend.model.Maintenance;
import com.vem.backend.repository.DocumentRepository;
import com.vem.backend.repository.MaintenanceRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * Single source of truth for "what's overdue or due soon" across the app:
 * the navbar notification badge, the dashboard alerts, and the monthly email
 * digest all read from here. Uses user-scoped batch queries (no per-vehicle
 * N+1) and reports the latest maintenance/document snapshot per vehicle.
 */
@Service
public class AlertService {

    private final MaintenanceRepository maintenanceRepository;
    private final DocumentRepository documentRepository;

    public AlertService(MaintenanceRepository maintenanceRepository, DocumentRepository documentRepository) {
        this.maintenanceRepository = maintenanceRepository;
        this.documentRepository = documentRepository;
    }

    /**
     * Human-readable alerts for vehicles whose latest maintenance or documents
     * are overdue, or fall due within {@code withinDays}.
     */
    public List<String> getAlertMessages(Long userId, int withinDays) {
        LocalDate today = LocalDate.now();
        List<String> alerts = new ArrayList<>();

        // Latest maintenance per vehicle — the list is already ordered by date desc.
        Set<Long> seenMaintenance = new HashSet<>();
        for (Maintenance m : maintenanceRepository.findByVehicleUserIdOrderByDateDesc(userId)) {
            if (m.getVehicle() == null || m.getNextDue() == null) continue;
            if (!seenMaintenance.add(m.getVehicle().getId())) continue;
            long days = ChronoUnit.DAYS.between(today, m.getNextDue());
            if (days < 0) {
                alerts.add(m.getVehicle().getVehicleName() + ": Service OVERDUE (" + m.getServiceType() + ")");
            } else if (days <= withinDays) {
                alerts.add(m.getVehicle().getVehicleName() + ": Service due in " + days + plural(days) + " (" + m.getServiceType() + ")");
            }
        }

        // Latest document snapshot per vehicle — ordered by id desc.
        Set<Long> seenDocs = new HashSet<>();
        for (Document d : documentRepository.findByVehicleUserIdOrderByIdDesc(userId)) {
            if (d.getVehicle() == null) continue;
            if (!seenDocs.add(d.getVehicle().getId())) continue;
            String name = d.getVehicle().getVehicleName();
            addDocAlert(alerts, name, "Insurance", d.getInsuranceExpiry(), today, withinDays);
            addDocAlert(alerts, name, "PUC", d.getPucExpiry(), today, withinDays);
            addDocAlert(alerts, name, "Registration", d.getRegistrationExpiry(), today, withinDays);
        }

        return alerts;
    }

    private void addDocAlert(List<String> alerts, String vehicleName, String label, LocalDate expiry, LocalDate today, int withinDays) {
        if (expiry == null) return;
        long days = ChronoUnit.DAYS.between(today, expiry);
        if (days < 0) {
            alerts.add(vehicleName + ": " + label + " EXPIRED");
        } else if (days <= withinDays) {
            alerts.add(vehicleName + ": " + label + " expires in " + days + plural(days));
        }
    }

    private String plural(long days) {
        return " day" + (days == 1 ? "" : "s");
    }
}