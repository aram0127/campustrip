package com.example.app.controller;

import com.example.app.domain.User;
import com.example.app.dto.CustomUserDetails;
import com.example.app.service.ApplicationService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.app.domain.Application;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    @Autowired
    private final ApplicationService applicationService;

    @Autowired
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }

    // 사용자 ID로 동행 신청 조회
    @GetMapping("/user/{userId}")
    public List<Application> getApplicationsByUserId(@PathVariable Integer userId) {
        return applicationService.getApplicationsByUserId(userId);
    }

    // 게시물 ID로 동행 신청 조회
    @GetMapping("/post/{postId}")
    public List<Application> getApplicationsByPostId(@PathVariable Integer postId) {
        return applicationService.getApplicationsByPostId(postId);
    }

    // 새 동행 신청 생성
    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        applicationService.saveApplication(application);
        return application;
    }

    // 동행 신청 수락 (신청받은 사람이 수락)
    @PutMapping("/update")
    public Application updateApplication(@RequestBody Application application, Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User currentUser = userDetails.getUser();
        if (!currentUser.getUserId().equals(application.getPost().getUser().getUserId()) && currentUser.getRole() != 0) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        applicationService.saveApplication(application);
        return application;
    }

    // 동행 신청 삭제 (신청한 사람이 취소)
    @DeleteMapping("/{userId}/{postId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public void deleteApplication(@PathVariable Integer userId, @PathVariable Integer postId) {
        applicationService.deleteApplication(userId, postId);
    }
}
