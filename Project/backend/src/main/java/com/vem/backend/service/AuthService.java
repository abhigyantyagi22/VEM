package com.vem.backend.service;

import com.vem.backend.config.JwtUtil;
import com.vem.backend.dto.LoginDto;
import com.vem.backend.dto.ProfileDto;
import com.vem.backend.dto.RegisterDto;
import com.vem.backend.model.User;
import com.vem.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
    }

    public User registerUser(RegisterDto dto) {
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email already taken");
        }
        User user = new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setPhone(dto.getPhone());
        user.setEmailVerified(false);

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));

        userRepository.save(user);

        try {
            emailService.sendVerificationEmail(user.getEmail(), token);
        } catch (Exception e) {
            System.err.println("[AuthService] Failed to send verification email: " + e.getMessage());
        }

        return user;
    }

    public String loginUser(LoginDto dto) {
        Optional<User> userOptional = userRepository.findByEmail(dto.getEmail());
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            String rawPassword = dto.getPassword();
            String storedPassword = user.getPassword();

            boolean bcryptMatch = false;
            try {
                bcryptMatch = storedPassword != null && passwordEncoder.matches(rawPassword, storedPassword);
            } catch (Exception ignored) {
                bcryptMatch = false;
            }

            boolean legacyPlaintextMatch = storedPassword != null && storedPassword.equals(rawPassword);
            boolean legacySha256Match = isSha256Hex(storedPassword) && sha256Hex(rawPassword).equalsIgnoreCase(storedPassword);

            if (bcryptMatch || legacyPlaintextMatch || legacySha256Match) {
                if (!user.isEmailVerified()) {
                    throw new IllegalArgumentException("EMAIL_NOT_VERIFIED");
                }
                // Migrate legacy password formats to BCrypt on successful login.
                if ((legacyPlaintextMatch || legacySha256Match) && !bcryptMatch) {
                    user.setPassword(passwordEncoder.encode(rawPassword));
                    userRepository.save(user);
                }
                return jwtUtil.generateToken(user.getEmail(), user.getId());
            }
        }
        throw new IllegalArgumentException("Invalid credentials");
    }

    private boolean isSha256Hex(String value) {
        return value != null && value.matches("^[a-fA-F0-9]{64}$");
    }

    private String sha256Hex(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : bytes) {
                hex.append(String.format("%02x", b));
            }
            return hex.toString();
        } catch (Exception e) {
            return "";
        }
    }

    public ProfileDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        ProfileDto dto = new ProfileDto();
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        return dto;
    }

    public ProfileDto updateProfile(Long userId, ProfileDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (dto.getName() != null && !dto.getName().isBlank()) {
            user.setName(dto.getName());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (dto.getNewPassword() != null && !dto.getNewPassword().isBlank()) {
            if (dto.getCurrentPassword() == null || dto.getCurrentPassword().isBlank()) {
                throw new IllegalArgumentException("Current password is required to set a new password");
            }
            if (!passwordEncoder.matches(dto.getCurrentPassword(), user.getPassword())) {
                throw new IllegalArgumentException("Current password is incorrect");
            }
            user.setPassword(passwordEncoder.encode(dto.getNewPassword()));
        }

        userRepository.save(user);
        ProfileDto response = new ProfileDto();
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        return response;
    }

    public String verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired verification link."));

        if (user.getVerificationTokenExpiry() == null || user.getVerificationTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Verification link has expired. Please request a new one.");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
        return "Email verified successfully";
    }

    public String resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("No account found with that email."));

        if (user.isEmailVerified()) {
            throw new IllegalArgumentException("This email is already verified.");
        }

        String token = UUID.randomUUID().toString();
        user.setVerificationToken(token);
        user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
        userRepository.save(user);

        emailService.sendVerificationEmail(email, token);
        return "Verification email sent";
    }

    public String resetPassword(String email, String newPassword) {
        Optional<User> userOptional = userRepository.findByEmail(email);
        if (!userOptional.isPresent()) {
            throw new IllegalArgumentException("User not found");
        }
        User user = userOptional.get();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        System.err.println("[AUTH DEBUG] Password reset for email: " + email);
        return "Password reset successfully";
    }
}
