package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class LocationMessage {
    private String userId;
    private String userName;
    private String groupId;  // 그룹/방 ID
    private double latitude;
    private double longitude;
    private long timestamp;
    // getters, setters, constructors
}