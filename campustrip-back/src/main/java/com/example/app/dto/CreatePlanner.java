package com.example.app.dto;

import com.example.app.domain.User;
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
    private User user; // 플래너 작성자의 membership_id
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private List<PlannerDetailDTO> plannerDetails;
}