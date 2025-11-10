package com.example.app.service;

import com.example.app.domain.Follow;
import com.example.app.domain.User;
import com.example.app.repository.FollowRepository;
import com.example.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FollowService {
    private final FollowRepository followRepository;
    private final UserRepository userRepository;

    @Autowired
    public FollowService(FollowRepository followRepository, UserRepository userRepository) {
        this.followRepository = followRepository;
        this.userRepository = userRepository;
    }

    public Follow followUser(Integer followerId, Integer followeeId) {
        Follow follow = new Follow();
        User follower = userRepository.findById(followerId).orElseThrow(null);
        follow.setTarget(follower);
        User followee = userRepository.findById(followeeId).orElseThrow(null);
        follow.setMembership(followee);
        followRepository.save(follow);
        return follow;
    }

    public Follow unfollowUser(Integer followerId, Integer followeeId) {
        Follow follow = followRepository.findByMembershipIdAndTargetId(followerId, followeeId).orElseThrow(null);
        if (follow != null) {
            followRepository.delete(follow);
        }
        return follow;
    }

    public boolean isFollowing(Integer followerId, Integer followeeId) {
        Follow follow = followRepository.findByMembershipIdAndTargetId(followerId, followeeId).orElse(null);
        if (follow != null) {
            return true;
        }
        return false;
    }

    public int getFollowerCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(null);
        if (user != null) {
            return followRepository.countByMembership(user);
        }
        return 0;
    }

    public int getFollowingCount(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(null);
        if (user != null) {
            return followRepository.countByTarget(user);
        }
        return 0;
    }

    public List<User> getFollowers(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(null);
        if (user != null) {
            return followRepository.findByMembership(user).stream()
                    .map(Follow::getTarget)
                    .toList();
        }
        return List.of();
    }

    public List<User> getFollowing(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow(null);
        if (user != null) {
            return followRepository.findByTarget(user).stream()
                    .map(Follow::getMembership)
                    .toList();
        }
        return List.of();
    }
}
