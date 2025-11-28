package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class PushNotificationRequest {
    private String token;
    private String title;
    private String body;
}
