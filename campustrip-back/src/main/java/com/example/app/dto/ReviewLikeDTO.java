package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewLikeDTO {
    private Integer userId;
    private Integer reviewId;
}
