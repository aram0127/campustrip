package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserRateDTO {
    private Integer raterId;
    private String raterName;
    private Integer targetId;
    private String targetName;
    private Integer rate;
    private String comment;
}
