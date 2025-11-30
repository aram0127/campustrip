package com.example.app.dto;

import lombok.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class ChatMessageDTO {
    private MessageType messageType;
    private Integer roomId;
    private Integer membershipId;
    private String userName;
    private String message;
    private MultipartFile image;
    private String imageUrl;
    private LocalDateTime timestamp;
    public ChatMessageDTO (MessageType messageType, Integer roomId, Integer membershipId, String userName, String message, LocalDateTime timestamp) {
        this.messageType = messageType;
        this.roomId = roomId;
        this.membershipId = membershipId;
        this.userName = userName;
        this.message = message;
        this.timestamp = timestamp;
    }
    public ChatMessageDTO(MessageType messageType, Integer chatId, Integer senderId, String senderName, String content, String imageUrl, LocalDateTime timestamp) {
        this.messageType = messageType;
        this.roomId = chatId;
        this.membershipId = senderId;
        this.userName = senderName;
        this.message = content;
        this.imageUrl = imageUrl;
        this.timestamp = timestamp;
    }

    public ChatMessageDTO(MessageType messageType, String senderName, String content, LocalDateTime timestamp) {
        this.messageType = messageType;
        this.userName = senderName;
        this.message = content;
        this.timestamp = timestamp;
    }
}
