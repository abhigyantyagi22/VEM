package com.vem.backend.controller;

import com.vem.backend.dto.LoginDto;
import com.vem.backend.dto.RegisterDto;
import com.vem.backend.model.User;
import com.vem.backend.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*") // Allows React frontend to call the API
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterDto registerDto) {
        try {
            User user = authService.registerUser(registerDto);
            return ResponseEntity.ok(user); // Normally don't return full mapped user, maybe UserDto instead
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDto loginDto) {
        try {
            String token = authService.loginUser(loginDto);
            return ResponseEntity.ok(token); // Return JWT Token
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody LoginDto loginDto) {
        try {
            String message = authService.resetPassword(loginDto.getEmail(), loginDto.getPassword());
            return ResponseEntity.ok(message);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
