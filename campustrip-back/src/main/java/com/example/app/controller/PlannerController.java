package com.example.app.controller;

import com.example.app.domain.Planner;
import com.example.app.domain.User;
import com.example.app.dto.CreatePlanner;
import com.example.app.dto.CustomUserDetails;
import com.example.app.dto.PlannerResponseDTO;
import com.example.app.service.ApplicationService;
import com.example.app.service.PlannerService;
import com.example.app.service.PostService;
import com.example.app.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/planners")
public class PlannerController {
    private final PlannerService plannerService;
    private final UserService userService;
    private final ApplicationService applicationService;
    private final PostService postService;

    @Autowired
    public PlannerController(PlannerService plannerService, UserService userService, ApplicationService applicationService, PostService postService) {
        this.plannerService = plannerService;
        this.userService = userService;
        this.applicationService = applicationService;
        this.postService = postService;
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
    public PlannerResponseDTO updatePlanner(@AuthenticationPrincipal CustomUserDetails customUserDetails, @PathVariable Integer plannerId, @RequestBody CreatePlanner createPlanner) {
        User user = userService.getUserByUserId(customUserDetails.getUsername());
        // 작성자라면 바로 편집 가능
        // createPlanner에 기존 작성자 id가 세팅되어있는지 확인
        if (user.getId() != createPlanner.getMembershipId()) {
            System.out.println("작성자 아님, 동행신청자 확인 필요");
            // 작성자 아니라면 planner에 연결된 post로 가서 자신의 apllication의 state가 1(수락)인지 검사
            try {
                boolean isAccepted = applicationService.checkApplicationByPostIdAndMembershipId(
                        createPlanner.getMembershipId(),
                        postService.getPostByPlanner(plannerId).getPostId());
                if (!isAccepted) {
                    System.out.println("동행신청자 아님 또는 수락된 동행신청자 아님");
                    // 수정 권한 없는 경우
                    throw new RuntimeException();
                }
            } catch (Exception e) {
                // 수정 권한 없거나 or 동행신청자체가 없음
                throw new RuntimeException("수정 권한이 없습니다.");
            }
        }

        Planner planner = plannerService.updatePlannerWithDetails(plannerId, createPlanner);
        return new PlannerResponseDTO(planner);
    }

    // 플래너 삭제
    @DeleteMapping("/{plannerId}")
    public void deletePlanner(@PathVariable Integer plannerId) {
        plannerService.deletePlanner(plannerId);
    }
}