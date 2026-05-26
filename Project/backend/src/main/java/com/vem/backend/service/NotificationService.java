package com.vem.backend.service;

import com.vem.backend.model.Document;
import com.vem.backend.model.Maintenance;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.DocumentRepository;
import com.vem.backend.repository.MaintenanceRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class NotificationService {
    private final VehicleRepository vehicleRepository;
    private final DocumentRepository documentRepository;
    private final MaintenanceRepository maintenanceRepository;

    public NotificationService(VehicleRepository vehicleRepository, DocumentRepository documentRepository, MaintenanceRepository maintenanceRepository) {
        this.vehicleRepository = vehicleRepository;
        this.documentRepository = documentRepository;
        this.maintenanceRepository = maintenanceRepository;
    }

    public List<String> getNotifications(Long userId) {
        List<String> notifications = new ArrayList<>();
        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        LocalDate today = LocalDate.now();

        for (Vehicle v : vehicles) {
            // Check Documents
            Optional<Document> docOpt = documentRepository.findTopByVehicleIdOrderByIdDesc(v.getId());
            if (docOpt.isPresent()) {
                Document doc = docOpt.get();
                if (doc.getInsuranceExpiry() != null && ChronoUnit.DAYS.between(today, doc.getInsuranceExpiry()) <= 7 && ChronoUnit.DAYS.between(today, doc.getInsuranceExpiry()) >= 0) {
                    notifications.add(v.getVehicleName() + ": Insurance expires in " + ChronoUnit.DAYS.between(today, doc.getInsuranceExpiry()) + " days!");
                } else if (doc.getInsuranceExpiry() != null && today.isAfter(doc.getInsuranceExpiry())) {
                    notifications.add(v.getVehicleName() + ": Insurance has EXPIRED!");
                }

                if (doc.getPucExpiry() != null && ChronoUnit.DAYS.between(today, doc.getPucExpiry()) <= 7 && ChronoUnit.DAYS.between(today, doc.getPucExpiry()) >= 0) {
                    notifications.add(v.getVehicleName() + ": PUC certificate expires in " + ChronoUnit.DAYS.between(today, doc.getPucExpiry()) + " days!");
                } else if (doc.getPucExpiry() != null && today.isAfter(doc.getPucExpiry())) {
                    notifications.add(v.getVehicleName() + ": PUC certificate has EXPIRED!");
                }
            }

            // Check Maintenance Next Due
            List<Maintenance> maintenances = maintenanceRepository.findByVehicleIdOrderByDateDesc(v.getId());
            if (!maintenances.isEmpty()) {
                Maintenance latest = maintenances.get(0); // Assuming sorted desc
                if (latest.getNextDue() != null && ChronoUnit.DAYS.between(today, latest.getNextDue()) <= 7 && ChronoUnit.DAYS.between(today, latest.getNextDue()) >= 0) {
                    notifications.add(v.getVehicleName() + ": Service (" + latest.getServiceType() + ") is due in " + ChronoUnit.DAYS.between(today, latest.getNextDue()) + " days!");
                } else if (latest.getNextDue() != null && today.isAfter(latest.getNextDue())) {
                    notifications.add(v.getVehicleName() + ": Service (" + latest.getServiceType() + ") is OVERDUE!");
                }
            }
        }
        return notifications;
    }
}