package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class VerificationInfo {
    private String code;
    private LocalDateTime expiryTime;

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }
}
