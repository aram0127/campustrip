package com.example.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreatePlanner {
    private Integer membershipId; // userId 또는 membershipId로 받을 수 있음
    private String title;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private List<PlannerDetailDTO> schedules;
}