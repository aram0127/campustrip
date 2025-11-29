package com.example.app.dto;

import com.example.app.enumtype.PushNotificationType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PushNotificationRequest {
    private Integer receiverId; //알람 받는 사람 (팔로우 당한 사람 등)
    private Integer senderId; //보내는사람 (팔로우 한 사람 등)
    private PushNotificationType type; //알람 타입 (예: FOLLOW, APPLICATIONREQUST, APPLICATIONACCEPT 등)
    private int referenceId; //참고 아이디 (예: 동행글 아이디 등)
    private String title;
    private String body;
}
