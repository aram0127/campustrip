package com.example.app.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.app.auth.EmailVerification;

import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {
    Optional<EmailVerification> findTopByEmailOrderByIdDesc(String email);
    void deleteByEmail(String email);
}