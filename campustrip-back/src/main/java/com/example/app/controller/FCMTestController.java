package com.example.app.controller;

import com.example.app.dto.PushNotificationRequest;
import com.example.app.service.FCMService;
import com.google.firebase.FirebaseApp;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/fcm")
@RequiredArgsConstructor
public class FCMTestController {

    private final FCMService fcmService;

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
    public Map<String, Object> sendTestNotification(@RequestBody PushNotificationRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            // ReceiverID로 등록된 사용자의 모든 디바이스(토큰)으로 전송
            if (request.getReceiverId() != null) {
                fcmService.sendNotificationToUser(request);
                result.put("success", true);
                result.put("message", "Notification sent to user's all devices");
                result.put("receiverId", request.getReceiverId());
            } else {
                result.put("success", false);
                result.put("error", "receiverId is required");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }
}
