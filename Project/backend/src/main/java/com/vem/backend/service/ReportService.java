package com.vem.backend.service;

import com.vem.backend.model.Document;
import com.vem.backend.model.FuelLog;
import com.vem.backend.model.Maintenance;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.DocumentRepository;
import com.vem.backend.repository.FuelLogRepository;
import com.vem.backend.repository.MaintenanceRepository;
import com.vem.backend.repository.VehicleRepository;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class ReportService {

    private static final PDFont FONT_BOLD = PDType1Font.HELVETICA_BOLD;
    private static final PDFont FONT_REG = PDType1Font.HELVETICA;
    private static final float MARGIN = 50f;

    private final VehicleRepository vehicleRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final DocumentRepository documentRepository;

    public ReportService(VehicleRepository vehicleRepository,
                         FuelLogRepository fuelLogRepository,
                         MaintenanceRepository maintenanceRepository,
                         DocumentRepository documentRepository) {
        this.vehicleRepository = vehicleRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.documentRepository = documentRepository;
    }

    public byte[] generateVehicleReport(Long userId, Long vehicleId) {
        Vehicle vehicle = vehicleRepository.findByIdAndUserId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        List<FuelLog> fuelLogs = fuelLogRepository.findByVehicleIdOrderByDateDesc(vehicleId);
        List<Maintenance> maintLogs = maintenanceRepository.findByVehicleIdOrderByDateDesc(vehicleId);
        Document latestDoc = documentRepository.findTopByVehicleIdOrderByIdDesc(vehicleId).orElse(null);

        double totalFuelCost = fuelLogs.stream().filter(l -> l.getFuelCost() != null).mapToDouble(FuelLog::getFuelCost).sum();
        double totalFuelLitres = fuelLogs.stream().filter(l -> l.getFuelAmount() != null).mapToDouble(FuelLog::getFuelAmount).sum();
        long totalKm = fuelLogs.stream().filter(l -> l.getDistanceDriven() != null && l.getDistanceDriven() > 0).mapToLong(FuelLog::getDistanceDriven).sum();
        double totalMaintCost = maintLogs.stream().filter(m -> m.getCost() != null).mapToDouble(Maintenance::getCost).sum();
        double tco = totalFuelCost + totalMaintCost;
        double kmPerL = (totalFuelLitres > 0 && totalKm > 0) ? totalKm / totalFuelLitres : 0;
        double costPerKm = totalKm > 0 ? tco / totalKm : 0;

        try (PDDocument doc = new PDDocument(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            ReportWriter w = new ReportWriter(doc);

            w.title("Vehicle Report — " + safe(vehicle.getVehicleName()));
            w.subtitle(safe(vehicle.getVehicleNumber()) + "  ·  " + safe(vehicle.getVehicleType())
                    + "  ·  generated " + LocalDate.now().format(DateTimeFormatter.ISO_DATE));
            w.gap(10);

            w.heading("Summary");
            w.keyValue("Total Cost of Ownership", rupees(tco));
            w.keyValue("Fuel Spend", rupees(totalFuelCost));
            w.keyValue("Maintenance Spend", rupees(totalMaintCost));
            w.keyValue("Distance Logged", totalKm + " km");
            w.keyValue("Fuel Efficiency", kmPerL > 0 ? String.format("%.2f km/L", kmPerL) : "N/A");
            w.keyValue("Cost per KM", costPerKm > 0 ? rupees(costPerKm) : "N/A");
            if (vehicle.getPurchaseDate() != null) {
                w.keyValue("Owned Since", vehicle.getPurchaseDate().toString());
            }
            w.gap(8);

            if (latestDoc != null) {
                w.heading("Documents");
                w.keyValue("Insurance Expiry", latestDoc.getInsuranceExpiry() != null ? latestDoc.getInsuranceExpiry().toString() : "N/A");
                w.keyValue("PUC Expiry", latestDoc.getPucExpiry() != null ? latestDoc.getPucExpiry().toString() : "N/A");
                w.keyValue("Registration Expiry", latestDoc.getRegistrationExpiry() != null ? latestDoc.getRegistrationExpiry().toString() : "N/A");
                w.gap(8);
            }

            w.heading("Fuel History (" + fuelLogs.size() + " entries)");
            w.tableHeader(new String[]{"Date", "Litres", "Cost", "KM Run"}, new float[]{110, 110, 130, 110});
            for (FuelLog l : fuelLogs) {
                w.tableRow(new String[]{
                        l.getDate() != null ? l.getDate().toString() : "-",
                        l.getFuelAmount() != null ? String.format("%.2f", l.getFuelAmount()) : "-",
                        l.getFuelCost() != null ? rupees(l.getFuelCost()) : "-",
                        l.getDistanceDriven() != null ? String.valueOf(l.getDistanceDriven()) : "-",
                }, new float[]{110, 110, 130, 110});
            }
            w.gap(10);

            w.heading("Maintenance History (" + maintLogs.size() + " entries)");
            w.tableHeader(new String[]{"Date", "Service", "Cost", "Next Due"}, new float[]{100, 180, 110, 100});
            for (Maintenance m : maintLogs) {
                w.tableRow(new String[]{
                        m.getDate() != null ? m.getDate().toString() : "-",
                        safe(m.getServiceType()),
                        m.getCost() != null ? rupees(m.getCost()) : "-",
                        m.getNextDue() != null ? m.getNextDue().toString() : "-",
                }, new float[]{100, 180, 110, 100});
            }

            w.close();
            doc.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new RuntimeException("Could not generate PDF report", e);
        }
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    // PDFBox standard fonts cannot encode the rupee glyph, so use "Rs."
    private static String rupees(double value) {
        return String.format("Rs. %,.2f", value);
    }

    /** Minimal top-down page writer with automatic page breaks. */
    private static class ReportWriter {
        private final PDDocument doc;
        private PDPageContentStream cs;
        private float y;

        ReportWriter(PDDocument doc) throws IOException {
            this.doc = doc;
            newPage();
        }

        private void newPage() throws IOException {
            if (cs != null) cs.close();
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            cs = new PDPageContentStream(doc, page);
            y = PDRectangle.A4.getHeight() - MARGIN;
        }

        private void ensureSpace(float needed) throws IOException {
            if (y - needed < MARGIN) newPage();
        }

        void title(String text) throws IOException {
            ensureSpace(30);
            write(FONT_BOLD, 20, MARGIN, text);
            y -= 26;
        }

        void subtitle(String text) throws IOException {
            ensureSpace(18);
            write(FONT_REG, 11, MARGIN, text);
            y -= 16;
        }

        void heading(String text) throws IOException {
            ensureSpace(26);
            y -= 6;
            write(FONT_BOLD, 13, MARGIN, text);
            y -= 18;
        }

        void keyValue(String key, String value) throws IOException {
            ensureSpace(16);
            write(FONT_REG, 11, MARGIN, key + ":");
            write(FONT_BOLD, 11, MARGIN + 170, value);
            y -= 15;
        }

        void tableHeader(String[] cells, float[] widths) throws IOException {
            ensureSpace(18);
            float x = MARGIN;
            for (int i = 0; i < cells.length; i++) {
                write(FONT_BOLD, 10, x, cells[i]);
                x += widths[i];
            }
            y -= 14;
        }

        void tableRow(String[] cells, float[] widths) throws IOException {
            ensureSpace(15);
            float x = MARGIN;
            for (int i = 0; i < cells.length; i++) {
                write(FONT_REG, 10, x, truncate(cells[i], widths[i]));
                x += widths[i];
            }
            y -= 13;
        }

        void gap(float amount) {
            y -= amount;
        }

        private String truncate(String text, float width) {
            int maxChars = (int) (width / 5.2f);
            if (text == null) return "";
            return text.length() > maxChars ? text.substring(0, Math.max(0, maxChars - 3)) + "..." : text;
        }

        private void write(PDFont font, float size, float x, String text) throws IOException {
            cs.beginText();
            cs.setFont(font, size);
            cs.newLineAtOffset(x, y);
            cs.showText(sanitize(text));
            cs.endText();
        }

        // strip characters Helvetica cannot encode (e.g. emoji, rupee sign)
        private String sanitize(String text) {
            if (text == null) return "";
            StringBuilder sb = new StringBuilder(text.length());
            for (char c : text.toCharArray()) {
                sb.append(c <= 0xFF ? c : '?');
            }
            return sb.toString();
        }

        void close() throws IOException {
            if (cs != null) cs.close();
        }
    }
}