package com.example.app.service;

import com.example.app.dto.FCMMessageDTO;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.FirebaseMessagingException;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

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
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;

    public FCMService(ObjectMapper objectMapper, FCMTokenService tokenService) {
        this.objectMapper = objectMapper;
        this.restTemplate = new RestTemplate();
        this.tokenService = tokenService;
    }
    //ai가 짠 로직
    // 사용자에게 알림 전송 (모든 디바이스)
    public void sendNotificationToUser(Integer membershipId, String title, String body) {
        List<String> tokens = tokenService.getTokensByMembershipId(membershipId);

        for (String token : tokens) {
            try {
                sendMessageTo(token, title, body);
            } catch (Exception e) {
                // 실패한 토큰 삭제
                tokenService.deleteToken(token);
            }
        }
    }
    // 단일 토큰으로 알림 전송
    public void sendMessageTo(String targetToken, String title, String body) throws IOException, FirebaseMessagingException {
        //String message = makeMessage(targetToken, title, body);
        String message = FirebaseMessaging.getInstance().send(Message.builder()
                .setNotification(Notification.builder()
                        .setTitle(title)
                        .setBody(body)
                        .build())
                .setToken(targetToken).build());

        //디버그
        System.out.println("FCM Message sent: " + message);

//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(getAccessToken());
//
//        HttpEntity<String> entity = new HttpEntity<>(message, headers);
//        String url = String.format(fcmApiUrl, projectId);
//
//        //여기서 전송
//        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new IllegalStateException("FCM request failed: " + response.getBody());
//        }
    }
    private String makeMessage(String targetToken, String title, String body) throws JsonProcessingException {
        FCMMessageDTO fcmMessage = FCMMessageDTO.builder()
                .message(FCMMessageDTO.Message.builder()
                        .token(targetToken)
                        .notification(FCMMessageDTO.Notification.builder()
                                .title(title)
                                .body(body)
                                .build())
                        .build())
                .validateOnly(false)
                .build();

        return objectMapper.writeValueAsString(fcmMessage);
    }
    private String getAccessToken() throws IOException {
        GoogleCredentials googleCredentials = GoogleCredentials
                .fromStream(new ClassPathResource(secretFileName).getInputStream())
                .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));

        googleCredentials.refreshIfExpired();
        return googleCredentials.getAccessToken().getTokenValue();
    }


    // 블로그 로직
    //푸시 알림을 보내는 쪽에서 액세스 토큰을 통해 Firebase와 통신하는 로직
//    private String getAccessToken() throws IOException {
//        GoogleCredentials googleCredentials = GoogleCredentials
//                .fromStream(new ClassPathResource(secretFileName).getInputStream())
//                .createScoped(List.of("https://www.googleapis.com/auth/cloud-platform"));
//
//        googleCredentials.refreshIfExpired();
//        return googleCredentials.getAccessToken().getTokenValue();
//    }
//    //메시지를 생성하는 로직
//    private String makeMessage(String targetToken, String title, String body)
//            throws JsonProcessingException {
//        FCMMessageDTO fcmMessage = FCMMessageDTO.builder()
//                .validateOnly(false)
//                .message(FCMMessageDTO.Message.builder()
//                        .token(targetToken)
//                        .notification(FCMMessageDTO.Notification.builder()
//                                .title(title)
//                                .body(body)
//                                .build())
//                        .build())
//                .build();
//
//        return objectMapper.writeValueAsString(fcmMessage);
//    }
//    //푸시 알람 요청을 하는 로직 (액세스 토큰으로 FCM 서버에게 이 메시지를 보내줘!라고 하는 로직)
//    public void sendMessageTo(String targetToken, String title, String body) throws IOException {
//        if (!StringUtils.hasText(targetToken)) {
//            throw new IllegalArgumentException("Target token must not be blank");
//        }
//        String message = makeMessage(targetToken, title, body);
//
//        HttpHeaders headers = new HttpHeaders();
//        headers.setContentType(MediaType.APPLICATION_JSON);
//        headers.setBearerAuth(getAccessToken());
//
//        HttpEntity<String> entity = new HttpEntity<>(message, headers);
//        String url = String.format(fcmApiUrl, projectId);
//        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, entity, String.class);
//
//        if (!response.getStatusCode().is2xxSuccessful()) {
//            throw new IllegalStateException("FCM request failed: " + response.getBody());
//        }
//    }
}
