package com.vem.backend.service;

import com.vem.backend.dto.DocumentDto;
import com.vem.backend.model.Document;
import com.vem.backend.model.Vehicle;
import com.vem.backend.repository.DocumentRepository;
import com.vem.backend.repository.VehicleRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DocumentService {
    private final DocumentRepository documentRepository;
    private final VehicleRepository vehicleRepository;

    public DocumentService(DocumentRepository documentRepository, VehicleRepository vehicleRepository) {
        this.documentRepository = documentRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public DocumentDto saveOrUpdate(DocumentDto dto) {
        Long vehicleId = dto.getVehicleId();
        if (vehicleId == null) {
            throw new RuntimeException("Vehicle id is required");
        }

        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        // Persist each update as a new snapshot so users can view document history.
        Document document = new Document();
        document.setVehicle(vehicle);
        document.setInsuranceExpiry(dto.getInsuranceExpiry());
        document.setPucExpiry(dto.getPucExpiry());
        document.setRegistrationExpiry(dto.getRegistrationExpiry());

        return mapToDto(documentRepository.save(document));
    }

    public DocumentDto updateDocument(Long id, DocumentDto dto) {
        if (id == null) {
            throw new RuntimeException("Document id is required");
        }

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document record not found"));

        Long vehicleId = dto.getVehicleId();
        if (vehicleId != null && !vehicleId.equals(document.getVehicle().getId())) {
            Vehicle vehicle = vehicleRepository.findById(vehicleId)
                    .orElseThrow(() -> new RuntimeException("Vehicle not found"));
            document.setVehicle(vehicle);
        }

        document.setInsuranceExpiry(dto.getInsuranceExpiry());
        document.setPucExpiry(dto.getPucExpiry());
        document.setRegistrationExpiry(dto.getRegistrationExpiry());

        return mapToDto(documentRepository.save(document));
    }

    public DocumentDto getByVehicle(Long vehicleId) {
        return documentRepository.findTopByVehicleIdOrderByIdDesc(vehicleId)
                .map(this::mapToDto)
                .orElse(null);
    }

    public List<DocumentDto> getHistoryByVehicle(Long vehicleId) {
        return documentRepository.findByVehicleIdOrderByIdDesc(vehicleId)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    public void deleteDocument(Long id) {
        if (id == null) {
            throw new RuntimeException("Document id is required");
        }

        Document document = documentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Document record not found"));

        documentRepository.delete(document);
    }

    private DocumentDto mapToDto(Document d) {
        DocumentDto dto = new DocumentDto();
        dto.setId(d.getId());
        dto.setVehicleId(d.getVehicle().getId());
        dto.setInsuranceExpiry(d.getInsuranceExpiry());
        dto.setPucExpiry(d.getPucExpiry());
        dto.setRegistrationExpiry(d.getRegistrationExpiry());
        return dto;
    }
}
