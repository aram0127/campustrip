package com.example.app.dto;

import com.example.app.domain.Planner;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class PlannerResponseDTO {
    private Integer plannerId;
    private Integer userId;
    private String userName;
    private LocalDate startDate;
    private LocalDate endDate;
    private List<PlannerDetailDTO> details;
    public PlannerResponseDTO(Planner planner) {
        this.plannerId = planner.getPlannerId();
        this.userId = planner.getUser().getId();
        this.userName = planner.getUser().getName();
        this.startDate = planner.getStartDate();
        this.endDate = planner.getEndDate();
    }
}
