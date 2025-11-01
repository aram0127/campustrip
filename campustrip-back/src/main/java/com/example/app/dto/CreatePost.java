package com.example.app.dto;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePost {
    private User user;
    private Post post;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
    private Integer teamSize = 0;
    private List<Integer> regions;
//    private Integer plannerId;
}
