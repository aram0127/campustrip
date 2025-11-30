package com.example.app.domain;

import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Document(collection = "push_notifications")
@AllArgsConstructor
@Getter @Setter
public class PushNotification {
    @Id
    private String id; // mongodb가 생성할 푸시 알림 고유 ID
    private Integer receiverId; // 알림 받는 사람 ID
    private Integer senderId; // 알림 보내는 사람 ID
    private String type; // 알림 타입 (예: FOLLOW, APPLICATION_REQUEST, APPLICATION_ACCEPT
    private int referenceId; // 참고 아이디 (예: 동행글 아이디 등)
    private String title; // 알림 제목
    private String body; // 알림 내용
    private LocalDateTime createdAt; // 알림 생성 시간

    public PushNotification() {
        // 기본 생성자에서 createdAt를 KST로 설정
        createdAt = java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }
}
