package com.example.app.dto;

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
    private LocalDate startDate;
    private LocalDate endDate;
    private List<PlannerDetailDTO> details;
}
