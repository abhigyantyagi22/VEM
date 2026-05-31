package com.vem.backend.service;

import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String token) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject("Verify your WheelSync account");

            String link = frontendUrl + "/verify?token=" + token;
            String html = "<div style='font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px'>"
                    + "<div style='text-align:center;margin-bottom:24px'>"
                    + "<h2 style='color:#0f766e;margin:0'>🛞 WheelSync</h2>"
                    + "</div>"
                    + "<h3 style='color:#0f172a'>Verify your email address</h3>"
                    + "<p style='color:#475569;line-height:1.6'>Thanks for signing up! Click the button below to verify your email address. This link expires in <strong>24 hours</strong>.</p>"
                    + "<div style='text-align:center;margin:32px 0'>"
                    + "<a href='" + link + "' style='display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#14b8a6,#0f766e);color:#fff;border-radius:12px;text-decoration:none;font-weight:700;font-size:16px'>Verify Email</a>"
                    + "</div>"
                    + "<p style='color:#94a3b8;font-size:12px'>If the button doesn't work, copy and paste this link:<br><a href='" + link + "' style='color:#0f766e'>" + link + "</a></p>"
                    + "<hr style='border:none;border-top:1px solid #e2e8f0;margin:24px 0'>"
                    + "<p style='color:#94a3b8;font-size:12px'>If you didn't create a WheelSync account, you can safely ignore this email.</p>"
                    + "</div>";

            helper.setText(html, true);
            mailSender.send(message);
        } catch (Exception e) {
            throw new RuntimeException("Failed to send verification email: " + e.getMessage());
        }
    }
}
