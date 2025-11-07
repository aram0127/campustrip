package com.example.app.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ChatMessage {
    private MessageType messageType;
    private String roomId;
    private String userName;
    private String message;
    private LocalDateTime timestamp;
}
