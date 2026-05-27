package com.vem.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

@Component
public class JwtSecretValidator implements ApplicationRunner {

    @Value("${app.jwt.secret:}")
    private String secret;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("Missing required JWT secret. Set the environment variable JWT_SECRET to a base64-encoded 32-byte key.");
        }

        try {
            byte[] keyBytes = io.jsonwebtoken.io.Decoders.BASE64.decode(secret);
            if (keyBytes.length < 32) {
                throw new IllegalStateException("The provided JWT secret is too short (" + keyBytes.length + " bytes). It must be at least 32 bytes (256 bits) for HS256.");
            }
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("The provided JWT secret is not valid base64: " + e.getMessage());
        }
    }
}
