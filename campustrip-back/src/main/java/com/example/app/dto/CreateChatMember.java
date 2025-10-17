package com.example.app.dto;

import lombok.*;
import com.example.app.domain.Post;
import com.example.app.domain.User;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatMember {
    private Post post;
    private User user;
}