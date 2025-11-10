package com.example.app.service;

import com.example.app.repository.FollowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FollowService {
    private final FollowRepository followRepository;

    @Autowired
    public FollowService(FollowRepository followRepository) {
        this.followRepository = followRepository;
    }

    public void followUser(Integer followerId, Integer followeeId) {
        // 팔로우 로직 구현
    }

    public void unfollowUser(Integer followerId, Integer followeeId) {
        // 언팔로우 로직 구현
    }

    public boolean isFollowing(Integer followerId, Integer followeeId) {
        // 팔로우 상태 확인 로직 구현
        return false;
    }

    public int getFollowerCount(Integer userId) {
        // 팔로워 수 조회 로직 구현
        return 0;
    }
}
