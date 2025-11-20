package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ChatDTO {
    private Integer id;
    private String title;
    private java.time.LocalDateTime createdAt;
}
