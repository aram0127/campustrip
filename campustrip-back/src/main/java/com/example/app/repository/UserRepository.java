package com.example.app.repository;

import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Integer> {
    @Query("SELECT u FROM User u WHERE u.userId = :userId")
    Optional<User> findByUserId(@Param("userId") String userId);
    @Query("SELECT u FROM User u LEFT JOIN FETCH u.university WHERE u.id = :id")
    Optional<User> findById(@Param("id") Integer id);
    User findByName(String name);
    boolean existsByUserId(String userId);
}