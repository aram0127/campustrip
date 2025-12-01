package com.example.app.repository;

import com.example.app.domain.Application;
import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    Optional<Application> findByUserAndPost(User user, Post post);
    void deleteByUserAndPost(User user, Post post);
    List<Application> findAllByUser(User user);
    List<Application> findAllByPost(Post post);
    @Query("SELECT a, ur FROM Application a " +
            "LEFT JOIN FETCH a.user " +
            "LEFT JOIN UserRate ur ON a.user.id = ur.target.id " +
            "WHERE a.post.postId = :postId")
    List<Object[]> findAllByPostIdWithUserRates(@Param("postId") Integer postId);
}
