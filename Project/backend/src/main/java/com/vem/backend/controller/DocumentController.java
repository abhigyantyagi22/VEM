package com.vem.backend.controller;

import com.vem.backend.dto.DocumentDto;
import com.vem.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")
@CrossOrigin(origins = "*")
public class DocumentController {
    
    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<DocumentDto> saveDocument(@RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.saveOrUpdate(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(@PathVariable Long id, @RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.updateDocument(id, dto));
    }

    @GetMapping
    public ResponseEntity<DocumentDto> getDocument(@RequestParam Long vehicleId) {
        DocumentDto doc = documentService.getByVehicle(vehicleId);
        if (doc == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(doc);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DocumentDto>> getDocumentHistory(@RequestParam Long vehicleId) {
        return ResponseEntity.ok(documentService.getHistoryByVehicle(vehicleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        documentService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
