package com.example.app.dto;

import lombok.*;
import org.bson.types.ObjectId;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class PushResponseDTO {
    private ObjectId id; // mongodb가 생성하는 푸시 알림 고유 ID
    private Integer receiverId; // 알림 받는 사람 ID
    private Integer senderId; // 알림 보내는 사람 ID
    private String type; // 알림 타입 (예: FOLLOW, APPLICATION_REQUEST, APPLICATION_ACCEPT
    private int referenceId; // 참고 아이디 (예: 동행글 아이디 등)
    private String title; // 알림 제목
    private String body; // 알림 내용
    private LocalDateTime createdAt; // 알림 생성 시간
}
