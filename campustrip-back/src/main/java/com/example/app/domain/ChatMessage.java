package com.example.app.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.ZoneId;

@Document(collection = "messages")
@AllArgsConstructor
@Getter @Setter
public class ChatMessage {

    @Id
    private String id; // mongodb가 생성할 메시지 고유 ID
    private Integer chatId; // 채팅방 ID
    private Integer senderId; // 메시지 보낸 사람 ID
    private String senderName; // 메시지 보낸 사람 이름
    private String content; // 메시지 내용
    private java.time.LocalDateTime timestamp; // 메시지 전송 시간


    public ChatMessage() {
        // 기본 생성자에서 timestamp를 KST로 설정
        timestamp = java.time.LocalDateTime.now().atZone(ZoneId.of("Asia/Seoul")).toLocalDateTime();
    }

}
