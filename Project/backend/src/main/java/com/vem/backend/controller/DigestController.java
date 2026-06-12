package com.vem.backend.controller;

import com.vem.backend.service.AuthenticatedUserDetails;
import com.vem.backend.service.EmailDigestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/digest")
@CrossOrigin(
        origins = "https://vem-ochre.vercel.app",
        allowCredentials = "true"
)
public class DigestController {

    private final EmailDigestService emailDigestService;

    public DigestController(EmailDigestService emailDigestService) {
        this.emailDigestService = emailDigestService;
    }

    @PostMapping("/send")
    public ResponseEntity<String> sendMyDigest(@AuthenticationPrincipal AuthenticatedUserDetails currentUser) {
        try {
            emailDigestService.sendDigestForUser(currentUser.getId());
            return ResponseEntity.ok("Digest sent");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Could not send digest email.");
        }
    }
}