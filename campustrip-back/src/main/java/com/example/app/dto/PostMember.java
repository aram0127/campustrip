package com.example.app.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class PostMember {
    Integer postId;
    Integer userId;
    String userName;
    String profilePhotoUrl;
    boolean rated;
}
