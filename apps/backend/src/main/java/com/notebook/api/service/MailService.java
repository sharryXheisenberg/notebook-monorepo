package com.notebook.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * Wraps JavaMailSender with a local-dev fallback: if SMTP isn't configured (no
 * MAIL_USERNAME set — the common case before you've set up a free email provider),
 * sending fails and this logs the reset link to the console instead of crashing the
 * request. This means the password reset flow is fully testable locally without needing
 * real email set up first — check your terminal/IDE console output for the link.
 *
 * To enable real emails: any free SMTP provider works (e.g. Gmail with an App Password,
 * or a free tier like Brevo/SendGrid). Set MAIL_HOST/MAIL_USERNAME/MAIL_PASSWORD env vars.
 */
@Service
@Slf4j
public class MailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendPasswordResetEmail(String toEmail, String resetLink) {
        if (fromAddress == null || fromAddress.isBlank()) {
            log.warn("MAIL_USERNAME not configured — password reset email not sent. "
                    + "Reset link for {}: {}", toEmail, resetLink);
            return;
        }
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromAddress);
            message.setTo(toEmail);
            message.setSubject("Reset your Notebook password");
            message.setText("Click the link below to reset your password. It expires in 30 minutes.\n\n" + resetLink);
            mailSender.send(message);
        } catch (Exception e) {
            log.warn("Failed to send password reset email to {} — falling back to console. Reset link: {}",
                    toEmail, resetLink, e);
        }
    }
}