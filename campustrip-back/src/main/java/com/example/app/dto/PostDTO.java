package com.example.app.dto;

import com.example.app.domain.Application;
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
    private java.time.LocalDate startAt;
    private java.time.LocalDate endAt;
    private Integer teamSize;
    private Integer memberSize;
    private List<RegionDTO> regions;
    private List<ApplicationSimpleDTO> applications;
    private List<String> postAssets;
    private Integer chatId;
}
