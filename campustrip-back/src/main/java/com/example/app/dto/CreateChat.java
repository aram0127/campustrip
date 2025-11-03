package com.example.app.dto;

import com.example.app.domain.Post;
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
    public CreateChat(Post post) {
        this.title = post.getTitle();
        this.userId = post.getUser().getId();
        this.createdAt = java.time.LocalDateTime.now();
    }
    public Chat toEntity() {
        return new Chat(null, java.time.LocalDateTime.now(), title, null);
    }
}
