package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    private MessageType messageType;
    private Integer roomId;
    private Integer membershipId;
    private String userName;
    private String message;
    private LocalDateTime timestamp;
}
