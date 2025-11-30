package com.example.app.controller;

import com.example.app.domain.Follow;
import com.example.app.domain.User;
import com.example.app.dto.FollowDTO;
import com.example.app.dto.PushNotificationRequest;
import com.example.app.dto.UserResponse;
import com.example.app.enumtype.PushNotificationType;
import com.example.app.service.FCMService;
import com.example.app.service.FollowService;
import com.example.app.service.UserService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {
    private final FollowService followService;
    private final FCMService fcmService;
    private final UserService userService;

    public FollowController(FollowService followService, FCMService fcmService, UserService userService) {
        this.followService = followService;
        this.fcmService = fcmService;
        this.userService = userService;
    }

    // 필요한 엔드포인트
    // 예: 팔로우, 언팔로우, 팔로우 상태 확인, 팔로워 수 조회, 팔로워 목록 조회 등
    @PutMapping("/follow")
    public FollowDTO followUser(Integer followerId, Integer followeeId) {
        FollowDTO followDTO = followService.followUser(followerId, followeeId);
        // 팔로우 알림 전송
        fcmService.sendNotificationToUser(
                new PushNotificationRequest(
                        followeeId,
                        followerId,
                        PushNotificationType.FOLLOW,
                        followerId,
                        "새로운 팔로워 알림",
                        userService.getUserById(followeeId).getName() + "님이 당신을 팔로우하기 시작했습니다."
                )
        );
        return followDTO;
    }

    @PutMapping("/unfollow")
    public FollowDTO unfollowUser(Integer followerId, Integer followeeId) {
        return followService.unfollowUser(followerId, followeeId);
    }

    @GetMapping("/isFollowing")
    public boolean isFollowing(Integer followerId, Integer followeeId) {
        return followService.isFollowing(followerId, followeeId);
    }

    @GetMapping("/followerCount")
    public int getFollowerCount(Integer userId) {
        return followService.getFollowerCount(userId);
    }

    @GetMapping("/followingCount")
    public int getFollowingCount(Integer userId) {
        return followService.getFollowingCount(userId);
    }

    @GetMapping("/followers")
    public List<UserResponse> getFollowers(Integer userId) {
        return followService.getFollowers(userId);
    }

    @GetMapping("/followings")
    public List<UserResponse> getFollowings(Integer userId) {
        return followService.getFollowings(userId);
    }
}
