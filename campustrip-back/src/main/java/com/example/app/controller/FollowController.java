package com.example.app.controller;

import com.example.app.domain.Follow;
import com.example.app.domain.User;
import com.example.app.service.FollowService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/follow")
public class FollowController {
    private final FollowService followService;

    public FollowController(FollowService followService) {
        this.followService = followService;
    }

    // 필요한 엔드포인트
    // 예: 팔로우, 언팔로우, 팔로우 상태 확인, 팔로워 수 조회, 팔로워 목록 조회 등
    @PutMapping("/follow")
    public Follow followUser(Integer followerId, Integer followeeId) {
        return followService.followUser(followerId, followeeId);
    }

    @PutMapping("/unfollow")
    public Follow unfollowUser(Integer followerId, Integer followeeId) {
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
    public List<User> getFollowers(Integer userId) {
        return followService.getFollowers(userId);
    }

    @GetMapping("/followings")
    public List<User> getFollowings(Integer userId) {
        return followService.getFollowings(userId);
    }
}
