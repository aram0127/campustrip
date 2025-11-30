package com.example.app.service;

import com.example.app.dto.PushNotificationRequest;
import com.example.app.enumtype.PushNotificationType;
import com.example.app.repository.PushNotificationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import java.io.IOException;
import java.util.List;

@Service
public class FCMService {

    @Value("${fcm.api.url}")
    private String fcmApiUrl;

    @Value("${fcm.secret.file}")
    private String secretFileName;

    @Value("${fcm.project.id}")
    private String projectId;

    private final FCMTokenService tokenService;
    private final PushNotificationRepository pushNotificationRepository;

    public FCMService(ObjectMapper objectMapper, FCMTokenService tokenService, PushNotificationRepository pushNotificationRepository) {
        this.pushNotificationRepository = pushNotificationRepository;
        this.tokenService = tokenService;
    }

    // 사용자에게 알림 전송 (모든 디바이스) - DTO 기반
    public void sendNotificationToUser(PushNotificationRequest request) {
        //알림 받을사람의 토큰 목록
        List<String> tokens = tokenService.getTokensByMembershipId(request.getReceiverId());

        for (String token : tokens) {
            try {
                sendMessageTo(token, request.getTitle(), request.getBody(), request.getType());
            } catch (Exception e) {
                // 실패한 토큰 삭제
                tokenService.deleteToken(token);
            }
        }
        pushNotificationRepository.save(request.toEntity());
    }

//    // 사용자에게 알림 전송 (모든 디바이스) - 기존 메서드 호환성 유지
//    public void sendNotificationToUser(Integer receiverID, String title, String body, PushNotificationType type) {
//        PushNotificationRequest request = new PushNotificationRequest(receiverID, null, type, title, body);
//        sendNotificationToUser(request);
//    }

    // 단일 토큰으로 알림 전송
    public void sendMessageTo(String targetToken, String title, String body, PushNotificationType type) throws IOException, FirebaseMessagingException {
        //String message = makeMessage(targetToken, title, body);
        String message = FirebaseMessaging.getInstance().send(Message.builder()
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .putData("type", String.valueOf(type))
                .setToken(targetToken).build());
    }

    private String getAccessToken() throws IOException {
        GoogleCredentials googleCredentials = GoogleCredentials
                .fromStream(new ClassPathResource(secretFileName).getInputStream())
                .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));

        googleCredentials.refreshIfExpired();
        return googleCredentials.getAccessToken().getTokenValue();
    }
}
