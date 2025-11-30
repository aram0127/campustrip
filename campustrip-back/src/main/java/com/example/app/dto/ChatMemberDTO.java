package com.example.app.dto;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class ChatMemberDTO {
    private String chatTitle;
    private Integer chatId;
    private Integer userId;
    private String profilePhotoUrl;
}
