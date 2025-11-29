package com.example.app.repository;

import com.example.app.domain.FCMToken;
import com.example.app.domain.FCMTokenId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FCMTokenRepository extends JpaRepository<FCMToken, FCMTokenId> {

    List<FCMToken> findByMembershipId(Integer membershipId);

    @Modifying
    @Query("DELETE FROM FCMToken f WHERE f.token = :token")
    void deleteByToken(@Param("token") String token);

    @Modifying
    @Query("DELETE FROM FCMToken f WHERE f.membershipId = :membershipId")
    void deleteByMembershipId(@Param("membershipId") Integer membershipId);

    boolean existsByMembershipIdAndToken(Integer membershipId, String token);
}

