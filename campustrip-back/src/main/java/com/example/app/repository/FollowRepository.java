package com.example.app.repository;

import com.example.app.domain.Follow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FollowRepository extends JpaRepository<Follow, Integer> {
    Optional<Follow> findByMembershipIdAndTargetId(Integer membershipId, Integer targetId);
}
