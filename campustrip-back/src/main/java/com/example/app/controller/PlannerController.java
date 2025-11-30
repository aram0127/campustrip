package com.example.app.controller;

import com.example.app.domain.Planner;
import com.example.app.domain.User;
import com.example.app.dto.CreatePlanner;
import com.example.app.dto.CustomUserDetails;
import com.example.app.dto.PlannerResponseDTO;
import com.example.app.service.PlannerService;
import com.example.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planners")
public class PlannerController {
    private final PlannerService plannerService;
    private final UserService userService;

    @Autowired
    public PlannerController(PlannerService plannerService, UserService userService) {
        this.plannerService = plannerService;
        this.userService = userService;
    }

    // 플래너 id로 상세 조회
    @GetMapping("/{plannerId}")
    public ResponseEntity<PlannerResponseDTO> getPlanner(@PathVariable Integer plannerId) {
        return plannerService.getPlannerWithDetails(plannerId)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 사용자 id로 플래너 목록 조회
    @GetMapping("/user/{memberId}")
    public List<PlannerResponseDTO> getPlannersByUserId(@PathVariable Integer memberId) {
        return plannerService.findAllByUserId(memberId).stream()
                .map(planner -> new PlannerResponseDTO(planner))
                .toList();
    }

    @GetMapping("/user")
    public List<PlannerResponseDTO> getPlannersByUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return plannerService.findAllByUserUserId(userDetails.getUsername()).stream()
                .map(planner -> new PlannerResponseDTO(planner))
                .toList();
    }

    // 새 플래너 생성 
    @PostMapping
    public PlannerResponseDTO createPlanner(@AuthenticationPrincipal CustomUserDetails customUserDetails, @RequestBody CreatePlanner createPlanner) {
        User user = userService.getUserByUserId(customUserDetails.getUsername());
        createPlanner.setMembershipId(user.getId());
        Planner planner = plannerService.savePlannerWithDetails(createPlanner);
        return new PlannerResponseDTO(planner);
    }   

    // 플래너 수정
    @PutMapping("/{plannerId}")
    public PlannerResponseDTO updatePlanner(@PathVariable Integer plannerId, @RequestBody CreatePlanner createPlanner) {
        Planner planner = plannerService.updatePlannerWithDetails(plannerId, createPlanner);
        return new PlannerResponseDTO(planner);
    }

    // 플래너 삭제
    @DeleteMapping("/{plannerId}")
    public void deletePlanner(@PathVariable Integer plannerId) {
        plannerService.deletePlanner(plannerId);
    }
}