package com.example.app.dto;

import lombok.*;
import com.example.app.domain.Chat;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateChat {
    private String title;
    private Integer userId;
    private java.time.LocalDateTime createdAt;

    public Chat toEntity() {
        return new Chat(null, java.time.LocalDateTime.now(), title, null);
    }
}
