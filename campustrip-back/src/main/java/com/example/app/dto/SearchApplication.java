package com.example.app.dto;


import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class SearchApplication {
    private Integer id;
    private String userId;
    private String name;
    private String profilePhotoUrl;
    private Float userScore;
    private Boolean applicationStatus;
}
