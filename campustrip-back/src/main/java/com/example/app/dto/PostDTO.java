package com.example.app.dto;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostDTO {
    private String userName;
    private Float userScore;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Integer teamSize;
    private Integer memberNumber;
    private List<String> regions;
    private Integer chatId;
}
