package com.vem.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseSchemaMigration(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            jdbcTemplate.execute("ALTER TABLE drivers MODIFY COLUMN vehicle_id BIGINT NULL");
            System.out.println("[DatabaseSchemaMigration] Ensured drivers.vehicle_id is nullable");
        } catch (Exception e) {
            System.out.println("[DatabaseSchemaMigration] Skipped vehicle_id migration: " + e.getMessage());
        }
    }
}