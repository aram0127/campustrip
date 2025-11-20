package com.example.app.repository;

import com.example.app.domain.Follow;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Follow.FollowId> {
    Optional<Follow> findByMembershipIdAndTargetId(Integer membershipId, Integer targetId);
    Integer countByMembership(User user);
    Integer countByTarget(User user);
    List<Follow> findByTarget(User user);
    List<Follow> findByMembership(User user);
}
