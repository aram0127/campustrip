package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import com.example.app.dto.AcceptApplication;
import com.example.app.dto.CustomUserDetails;
import com.example.app.dto.SearchApplication;
import com.example.app.service.ApplicationService;
import com.example.app.service.ChatService;
import com.example.app.service.PostService;
import com.example.app.service.UserService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.app.domain.Application;
import com.example.app.dto.CreateChatMember;
import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final ChatService chatService;
    private final PostService postService;
    private final UserService userService;

    @Autowired
    public ApplicationController(ApplicationService applicationService, ChatService chatService, PostService postService, UserService userService) {
        this.applicationService = applicationService;
        this.chatService = chatService;
        this.postService = postService;
        this.userService = userService;
    }

    // 사용자 ID로 동행 신청 조회
    @GetMapping("/user/{userId}")
    public List<Application> getApplicationsByUserId(@PathVariable Integer userId) {
        return applicationService.getApplicationsByUserId(userId);
    }

    // 게시물 ID로 동행 신청 조회
    @GetMapping("/post/{postId}")
    public List<SearchApplication> getApplicationsByPostId(@PathVariable Integer postId) {
        List<Application> applications = applicationService.getApplicationsByPostId(postId);
        List<SearchApplication> searchApplications = applications.stream()
                .map(app -> new SearchApplication(app.getUser().getId(), app.getUser().getUserId(), app.getUser().getName(), app.getUser().getUserScore(), app.getApplicationStatus()))
                .toList();
        return searchApplications;
    }

    // 새 동행 신청 생성
    @PostMapping
    public Application createApplication(@RequestBody Application application) {
        applicationService.saveApplication(application);
        return application;
    }

    // 동행 신청 수락 (신청받은 사람이 수락)
    @PutMapping("/accept")
    public Application acceptApplication(@RequestBody AcceptApplication application, Authentication authentication) {
        return updateApplicationStatus(application, authentication, true);
    }

    @PutMapping("/reject")
    public Application rejectApplication(@RequestBody AcceptApplication application, Authentication authentication) {
        return updateApplicationStatus(application, authentication, false);
    }

    private Application updateApplicationStatus(AcceptApplication application, Authentication authentication, Boolean status) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        User currentUser = userDetails.getUser();
        Post post = postService.getPostById(application.getPostId());
        if (!currentUser.getUserId().equals(post.getUser().getUserId()) && currentUser.getRole() != 0) {
            throw new AccessDeniedException("권한이 없습니다.");
        }
        User user = userService.getUserById(application.getUserId());
        Application app = new Application();
        app.setPost(post);
        app.setUser(user);
        app.setApplicationStatus(status);
        applicationService.saveApplication(app);
        if(status) {
            chatService.saveChatMember(new CreateChatMember(app.getPost(), app.getUser()));
        }
        return app;
    }

    // 동행 신청 삭제 (신청한 사람이 취소)
    @DeleteMapping("/{userId}/{postId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public void deleteApplication(@PathVariable Integer userId, @PathVariable Integer postId) {
        applicationService.deleteApplication(userId, postId);
    }
}
