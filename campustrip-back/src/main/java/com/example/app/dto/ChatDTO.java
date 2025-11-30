package com.example.app.dto;

import com.example.app.enumtype.MessageType;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {
    private Integer id;
    private String title;
    private java.time.LocalDateTime createdAt;
    private MessageType lastMessageType;
    private String senderName;
    private String lastMessage;
    private java.time.LocalDateTime lastMessageTime;
    private String profilePhotoUrl;
}
