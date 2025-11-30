package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlannerDetailDTO {
    private Integer plannerOrder;
    private Integer day;
    private String googlePlaceId;
}