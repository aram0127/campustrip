package com.example.app.dto;

import lombok.*;

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
    private LocalDateTime timestamp;
}
