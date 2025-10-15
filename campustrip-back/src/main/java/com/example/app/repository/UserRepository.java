package com.example.app.repository;

import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    User findByName(String name);
    void deleteByUserId(String userId);
}