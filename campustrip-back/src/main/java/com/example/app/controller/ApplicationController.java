package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import com.example.app.dto.*;
import com.example.app.enumtype.PushNotificationType;
import com.example.app.service.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.app.domain.Application;

import java.util.List;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    private final ApplicationService applicationService;
    private final ChatService chatService;
    private final PostService postService;
    private final UserService userService;
    private final ChatMessageService chatMessageService;
    private final FCMService fcmService;

    @Autowired
    public ApplicationController(ApplicationService applicationService, ChatService chatService, PostService postService, UserService userService, ChatMessageService chatMessageService, FCMService fcmService) {
        this.applicationService = applicationService;
        this.chatService = chatService;
        this.postService = postService;
        this.userService = userService;
        this.chatMessageService = chatMessageService;
        this.fcmService = fcmService;
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
                .map(app -> new SearchApplication(app.getUser().getId(), app.getUser().getUserId(), app.getUser().getName(), app.getUser().getProfilePhotoUrl(), app.getUser().getUserScore(), app.getApplicationStatus()))
                .toList();
        return searchApplications;
    }

    // 새 동행 신청 생성
    @PostMapping
    public Application createApplication(@RequestBody CreateApplicationRequest request) {
        return applicationService.createApplication(request);
    }

    // 동행 신청 수락 (신청받은 사람이 수락)
    @PutMapping("/accept")
    public Application acceptApplication(@RequestBody AcceptApplication application, Authentication authentication) {
        Post post = postService.getPostById(application.getPostId());
        chatMessageService.sendJoinMessage(post.getChat(), application.getUserId());
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

        // 동행신청 수락/거절 알림 전송 로직 추가
        PushNotificationRequest notificationRequest;
        if(status) {
            chatService.saveChatMember(new CreateChatMember(app.getPost(), app.getUser()));
            notificationRequest = new PushNotificationRequest(
                    user.getId(),
                    post.getUser().getId(),
                    PushNotificationType.APPLICATION_ACCEPT,
                    post.getPostId(),
                    "동행 신청이 수락되었습니다.",
                    post.getTitle() + "에 대한 동행 신청이 수락되었습니다."
            );
        }else {
            notificationRequest = new PushNotificationRequest(
                    user.getId(),
                    post.getUser().getId(),
                    PushNotificationType.APPLICATION_REJECT,
                    post.getPostId(),
                    "동행 신청이 거절되었습니다.",
                    post.getTitle() + "에 대한 동행 신청이 거절되었습니다."
            );
        }
        fcmService.sendNotificationToUser(notificationRequest);

        return app;
    }

    // 동행 신청 삭제 (신청한 사람이 취소)
    @DeleteMapping("/{userId}/{postId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public void deleteApplication(@PathVariable Integer userId, @PathVariable Integer postId) {
        applicationService.deleteApplication(userId, postId);
    }

    @PutMapping("/unsubscribe/post/{postId}")
    public void unsubscribeApplicationByPost(@PathVariable Integer postId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        unsubscribeApplication(postId, userDetails.getUser().getUserId());
    }

    @PutMapping("/unsubscribe/chat/{chatId}")
    public void unsubscribeApplicationByChat(@PathVariable Integer chatId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 채팅방 ID로 게시물 ID 조회
        Integer postId = chatService.getPostIdByChatId(chatId);
        if (postId != null) {
            unsubscribeApplication(postId, userDetails.getUser().getUserId());
        }
    }

    private void unsubscribeApplication(Integer postId, String userId) {
        User user = userService.getUserByUserId(userId);
        // 동행 신청 상태 변경 (신청 취소)
        applicationService.updateApplicationStatus(postId, user, false);
        // 채팅방에 탈퇴 메세지 전송
        chatMessageService.sendLeaveMessage(postId, user);
        // 채팅방에서 사용자 제거
        chatService.removeChatMemberByPostAndUser(postId, user);
    }
}
