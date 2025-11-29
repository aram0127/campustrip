package com.example.app.controller;

import com.example.app.service.FCMService;
import com.google.firebase.FirebaseApp;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
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
    public Map<String, Object> sendTestNotification(@RequestBody TestNotificationRequest request) {
        Map<String, Object> result = new HashMap<>();
        try {
            // membershipId가 있으면 사용자의 모든 디바이스로 전송
            if (request.getMembershipId() != null) {
                fcmService.sendNotificationToUser(
                    request.getMembershipId(),
                    request.getTitle() != null ? request.getTitle() : "테스트 알림",
                    request.getBody() != null ? request.getBody() : "FCM 연결 테스트입니다"
                );
                result.put("success", true);
                result.put("message", "Notification sent to user's all devices");
            }
            // token이 있으면 특정 토큰으로만 전송
            else if (request.getToken() != null) {
                Message message = Message.builder()
                        .setNotification(Notification.builder()
                                .setTitle(request.getTitle() != null ? request.getTitle() : "테스트 알림")
                                .setBody(request.getBody() != null ? request.getBody() : "FCM 연결 테스트입니다")
                                .build())
                        .setToken(request.getToken())
                        .build();

                // 단일 토큰으로 메시지 전송
                String response = FirebaseMessaging.getInstance().send(message);
                System.out.println("단일 토큰으로 전송한 내용: " + response);

                result.put("success", true);
                result.put("messageId", response);
            } else {
                result.put("success", false);
                result.put("error", "Either membershipId or token is required");
            }
        } catch (Exception e) {
            result.put("success", false);
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Getter
    @Setter
    public static class TestNotificationRequest {
        private Integer membershipId;
        private String token;
        private String title;
        private String body;
    }
}
