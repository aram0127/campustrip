package com.example.app.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRate {
    private Integer targetId;
    private Integer rate;
    private String comment;
}
