package com.example.app.dto;

import com.example.app.domain.Post;
import com.example.app.domain.Review;
import com.example.app.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateReview {
    private Integer reviewId;
    private User user;
    private Post post;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    // 첨부 이미지 파일 - aws에 업로드 후 url로 저장 예정
    private List<String> images;

    public Review toEntity() {
        Review newReview = new Review();
        newReview.setUser(this.user);
        newReview.setPost(this.post);
        newReview.setTitle(this.title);
        newReview.setBody(this.body);
        newReview.setCreatedAt(this.createdAt);
        newReview.setUpdatedAt(this.createdAt);
        return newReview;
    }
}
