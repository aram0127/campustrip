package com.example.app.dto;


import com.example.app.domain.Review;
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
    private UserResponse user;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt;
    private java.time.LocalDateTime updatedAt;
    private Integer postId;
    private Integer likeCount;
    private Boolean likedByCurrentUser;
    // 첨부 이미지 파일 URL 리스트 (reviewAsset와 매핑)
    private java.util.List<String> imageUrls;

    public ReviewDTO(Review review) {
        this.reviewId = review.getId();
        if (review.getUser() != null) {
            this.user = new UserResponse(review.getUser());
        }
        this.title = review.getTitle();
        this.body = review.getBody();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();
        if (review.getPost() != null) {
            this.postId = review.getPost().getPostId();
        }
    }
}
