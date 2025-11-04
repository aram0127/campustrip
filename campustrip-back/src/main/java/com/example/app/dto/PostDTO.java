package com.example.app.dto;

import com.example.app.domain.Application;
import com.example.app.domain.Region;
import com.example.app.domain.User;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private Integer postId;
    private User user;
    private Float userScore;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Integer teamSize;
    private Integer memberSize;
    private List<Region> regions;
    private Application application;
    private Integer chatId;

    private List<Application> applications;
}
