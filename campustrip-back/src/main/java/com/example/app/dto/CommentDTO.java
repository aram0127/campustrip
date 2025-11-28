package com.example.app.dto;

import com.example.app.domain.Comment;
import lombok.*;
import org.joda.time.DateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CommentDTO {
    private Integer id;
    private Integer userId;
    private String userName;
    private Integer reviewId;
    private String body;
    private DateTime createdAt;

    public CommentDTO(Comment comment) {
        this.id = comment.getId();
        this.userId = comment.getUser().getId();
        this.userName = comment.getUser().getName();
        this.reviewId = comment.getReview().getId();
        this.body = comment.getBody();
        this.createdAt = new DateTime(comment.getCreatedAt());
    }
}
