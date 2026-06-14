package com.vem.backend.service;

import com.vem.backend.model.FuelLog;
import com.vem.backend.model.Maintenance;
import com.vem.backend.model.User;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.FuelLogRepository;
import com.vem.backend.repository.MaintenanceRepository;
import com.vem.backend.repository.UserRepository;
import com.vem.backend.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class EmailDigestService {

    private static final Logger log = LoggerFactory.getLogger(EmailDigestService.class);

    private static final int DIGEST_ALERT_WINDOW_DAYS = 30;

    private final JavaMailSender mailSender;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final AlertService alertService;

    @Value("${app.mail.from:}")
    private String fromAddress;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailDigestService(JavaMailSender mailSender,
                              UserRepository userRepository,
                              VehicleRepository vehicleRepository,
                              FuelLogRepository fuelLogRepository,
                              MaintenanceRepository maintenanceRepository,
                              AlertService alertService) {
        this.mailSender = mailSender;
        this.userRepository = userRepository;
        this.vehicleRepository = vehicleRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.alertService = alertService;
    }

    public boolean isMailConfigured() {
        return mailUsername != null && !mailUsername.isBlank();
    }

    /** Runs at 08:00 on the 1st of every month. */
    @Scheduled(cron = "0 0 8 1 * *")
    public void sendMonthlyDigestToAllUsers() {
        if (!isMailConfigured()) {
            log.warn("Monthly digest skipped: SPRING_MAIL_USERNAME is not configured.");
            return;
        }
        for (User user : userRepository.findAll()) {
            try {
                sendDigestForUser(user.getId());
            } catch (Exception e) {
                log.error("Could not send digest to user {}: {}", user.getEmail(), e.getMessage());
            }
        }
    }

    public void sendDigestForUser(Long userId) {
        if (!isMailConfigured()) {
            throw new IllegalStateException("Email is not configured on the server (SPRING_MAIL_USERNAME missing).");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String body = buildDigestBody(user);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress == null || fromAddress.isBlank() ? mailUsername : fromAddress);
        message.setTo(user.getEmail());
        message.setSubject("WheelSync — Your Monthly Fleet Digest");
        message.setText(body);
        mailSender.send(message);
        log.info("Digest email sent to {}", user.getEmail());
    }

    private String buildDigestBody(User user) {
        Long userId = user.getId();
        YearMonth lastMonth = YearMonth.from(LocalDate.now().minusMonths(1));
        LocalDate monthStart = lastMonth.atDay(1);
        LocalDate monthEnd = lastMonth.atEndOfMonth();

        List<Vehicle> vehicles = vehicleRepository.findByUserId(userId);
        List<FuelLog> fuelLogs = fuelLogRepository.findByVehicleUserIdOrderByDateDesc(userId);
        List<Maintenance> maintLogs = maintenanceRepository.findByVehicleUserIdOrderByDateDesc(userId);

        double monthFuel = fuelLogs.stream()
                .filter(l -> l.getDate() != null && !l.getDate().isBefore(monthStart) && !l.getDate().isAfter(monthEnd))
                .filter(l -> l.getFuelCost() != null)
                .mapToDouble(FuelLog::getFuelCost).sum();
        double monthMaint = maintLogs.stream()
                .filter(m -> m.getDate() != null && !m.getDate().isBefore(monthStart) && !m.getDate().isAfter(monthEnd))
                .filter(m -> m.getCost() != null)
                .mapToDouble(Maintenance::getCost).sum();

        Map<Long, Double> lifetimeByVehicle = new HashMap<>();
        for (FuelLog l : fuelLogs) {
            if (l.getFuelCost() != null && l.getVehicle() != null) {
                lifetimeByVehicle.merge(l.getVehicle().getId(), l.getFuelCost(), Double::sum);
            }
        }
        for (Maintenance m : maintLogs) {
            if (m.getCost() != null && m.getVehicle() != null) {
                lifetimeByVehicle.merge(m.getVehicle().getId(), m.getCost(), Double::sum);
            }
        }
        Vehicle topVehicle = vehicles.stream()
                .max(Comparator.comparingDouble(v -> lifetimeByVehicle.getOrDefault(v.getId(), 0.0)))
                .orElse(null);

        StringBuilder sb = new StringBuilder();
        sb.append("Hi ").append(user.getName() == null || user.getName().isBlank() ? "there" : user.getName()).append(",\n\n");
        sb.append("Here is your WheelSync digest for ").append(lastMonth).append(":\n\n");

        sb.append("LAST MONTH'S SPEND\n");
        sb.append("  Fuel:        Rs. ").append(String.format("%,.2f", monthFuel)).append("\n");
        sb.append("  Maintenance: Rs. ").append(String.format("%,.2f", monthMaint)).append("\n");
        sb.append("  Total:       Rs. ").append(String.format("%,.2f", monthFuel + monthMaint)).append("\n\n");

        if (topVehicle != null) {
            sb.append("COSTLIEST VEHICLE (lifetime)\n");
            sb.append("  ").append(topVehicle.getVehicleName())
              .append(" (").append(topVehicle.getVehicleNumber()).append(") — Rs. ")
              .append(String.format("%,.2f", lifetimeByVehicle.getOrDefault(topVehicle.getId(), 0.0)))
              .append("\n\n");
        }

        sb.append("DUE IN THE NEXT ").append(DIGEST_ALERT_WINDOW_DAYS).append(" DAYS\n");
        List<String> alerts = alertService.getAlertMessages(userId, DIGEST_ALERT_WINDOW_DAYS);
        if (alerts.isEmpty()) {
            sb.append("  Nothing due — you're all clear!\n");
        } else {
            for (String alert : alerts) {
                sb.append("  ").append(alert).append("\n");
            }
        }

        sb.append("\nDrive safe,\nWheelSync\n");
        return sb.toString();
    }
}