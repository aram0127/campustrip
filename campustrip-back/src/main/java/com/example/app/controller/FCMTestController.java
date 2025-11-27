package com.example.app.controller;

import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fcm")
public class FCMTestController {

    @GetMapping("/status")
    public Map<String, Object> checkFCMStatus() {
        Map<String, Object> status = new HashMap<>();
        try {
            boolean isInitialized = !FirebaseApp.getApps().isEmpty();
            status.put("initialized", isInitialized);

            if (isInitialized) {
                FirebaseApp app = FirebaseApp.getInstance();
                status.put("appName", app.getName());
                status.put("message", "FCM is connected");
            } else {
                status.put("message", "FCM is not initialized");
            }
        } catch (Exception e) {
            status.put("initialized", false);
            status.put("error", e.getMessage());
        }
        return status;
    }

    @PostMapping("/test")
    public Map<String, String> sendTestNotification(@RequestParam String token) {
        Map<String, String> result = new HashMap<>();
        try {
            Message message = Message.builder()
                    .setNotification(Notification.builder()
                            .setTitle("테스트 알림")
                            .setBody("FCM 연결 테스트입니다")
                            .build())
                    .setToken(token)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            result.put("success", "true");
            result.put("messageId", response);
        } catch (Exception e) {
            result.put("success", "false");
            result.put("error", e.getMessage());
        }
        return result;
    }
}
