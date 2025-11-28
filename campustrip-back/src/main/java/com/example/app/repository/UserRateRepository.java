package com.example.app.repository;

import com.example.app.domain.UserRate;
import com.example.app.domain.UserRateId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserRateRepository extends JpaRepository<UserRate, UserRateId> {
    List<UserRate> findByTargetId(Integer targetId);
    List<UserRate> findByRaterId(Integer raterId);

    // targetId로 해당 사용자를 대상으로 한 모든 rate 합계를 반환
    @Query("SELECT COALESCE(SUM(ur.rate), 0) FROM UserRate ur WHERE ur.target.id = :targetId")
    Integer sumRateByTargetId(@Param("targetId") Integer targetId);
}
