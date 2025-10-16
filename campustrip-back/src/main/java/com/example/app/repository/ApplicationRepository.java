package com.example.app.repository;

import com.example.app.domain.Application;
import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {
    Application findByUserAndPost(User user, Post post);
    void deleteByUserAndPost(User user, Post post);
    List<Application> findAllByUser(User user);
    List<Application> findAllByPost(Post post);
}
