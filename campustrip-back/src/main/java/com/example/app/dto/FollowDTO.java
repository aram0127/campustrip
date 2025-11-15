package com.example.app.dto;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class FollowDTO {
    private Integer followerId;
    private Integer targetId;
    private String followerName;
    private String targetName;
    private LocalDateTime createdAt;
}