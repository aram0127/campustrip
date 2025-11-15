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
    private Integer postId;
    private User user;
    private Post post;
    private String title;
    private String body;
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();
    private java.time.LocalDate startAt;
    private java.time.LocalDate endAt;
    private Integer teamSize = 0;
    private List<Integer> regions;
    private Integer plannerId;
    public Post toEntity() {
        Post newPost = new Post();
        newPost.setUser(this.user);
        newPost.setTitle(this.title);
        newPost.setBody(this.body);
        newPost.setCreatedAt(this.createdAt);
        newPost.setUpdatedAt(this.createdAt);
        newPost.setStartAt(this.startAt);
        newPost.setEndAt(this.endAt);
        newPost.setTeamSize(this.teamSize);
        return newPost;
    }
}
