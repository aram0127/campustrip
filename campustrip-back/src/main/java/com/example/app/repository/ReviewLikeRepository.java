package com.example.app.repository;

import com.example.app.domain.Review;
import com.example.app.domain.ReviewLike;
import com.example.app.domain.ReviewLikeId;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, ReviewLikeId> {
    ReviewLike findByUserAndReview(User user, Review review);
}
