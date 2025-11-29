package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRateDTO {
    private Integer targetId;
    private String targetName;
    private Integer rate;
    private String comment;
}
