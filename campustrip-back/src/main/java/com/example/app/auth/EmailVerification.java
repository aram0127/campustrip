package com.example.app.auth;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_verifications")
public class EmailVerification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false, length = 10)
    private String code;

    @Column(name="expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name="created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(nullable = false)
    private boolean verified;

    protected EmailVerification() {}

    public EmailVerification(String email, String code, LocalDateTime expiresAt) {
        this.email = email;
        this.code = code;
        this.expiresAt = expiresAt;
        this.createdAt = LocalDateTime.now();
        this.verified = false;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getCode() { return code; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public boolean isVerified() { return verified; }

    public void markVerified() { this.verified = true; }
}
