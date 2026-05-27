package com.vem.backend.controller;

import com.vem.backend.dto.DocumentDto;
import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.DocumentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/documents")

@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)

public class DocumentController {

    private final DocumentService documentService;

    public DocumentController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @PostMapping
    public ResponseEntity<DocumentDto> saveDocument(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.saveOrUpdate(currentUser.getId(), dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<DocumentDto> updateDocument(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id, @RequestBody DocumentDto dto) {
        return ResponseEntity.ok(documentService.updateDocument(currentUser.getId(), id, dto));
    }

    @GetMapping
    public ResponseEntity<DocumentDto> getDocument(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestParam Long vehicleId) {
        DocumentDto doc = documentService.getByVehicle(currentUser.getId(), vehicleId);

        if (doc == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(doc);
    }

    @GetMapping("/history")
    public ResponseEntity<List<DocumentDto>> getDocumentHistory(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @RequestParam Long vehicleId) {
        return ResponseEntity.ok(documentService.getHistoryByVehicle(currentUser.getId(), vehicleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@AuthenticationPrincipal AuthenticatedUserDetails currentUser, @PathVariable Long id) {
        documentService.deleteDocument(currentUser.getId(), id);
        return ResponseEntity.noContent().build();
    }
}