package com.example.app.dto;


import com.example.app.domain.Review;
import com.example.app.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewDTO {
    private Integer reviewId;
    private User user;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Integer postId;

    // 첨부 이미지 파일 URL 리스트 (reviewAsset와 매핑)
    private java.util.List<String> imageUrls;

    public ReviewDTO(Review review) {
        this.reviewId = review.getId();
        this.user = review.getUser();
        this.title = review.getTitle();
        this.body = review.getBody();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        this.postId = review.getPost().getPostId();
    }
}
