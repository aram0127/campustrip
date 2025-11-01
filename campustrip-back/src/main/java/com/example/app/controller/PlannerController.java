// java
package com.example.app.controller;

import com.example.app.dto.PlannerResponseDTO;
import com.example.app.service.PlannerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/planners")
public class PlannerController {
    private final PlannerService plannerService;

    @Autowired
    public PlannerController(PlannerService plannerService) {
        this.plannerService = plannerService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlannerResponseDTO> getPlanner(@PathVariable Integer id) {
        return plannerService.getPlannerWithDetails(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
