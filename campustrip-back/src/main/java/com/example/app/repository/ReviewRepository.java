package com.example.app.repository;

import com.example.app.domain.Review;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count
}
