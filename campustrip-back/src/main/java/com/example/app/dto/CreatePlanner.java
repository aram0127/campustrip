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
    private Integer membershipId;
    private String title;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private List<PlannerDetailDTO> schedules;
}