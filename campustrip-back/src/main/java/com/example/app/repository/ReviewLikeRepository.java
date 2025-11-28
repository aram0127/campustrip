package com.example.app.repository;

import com.example.app.domain.Review;
import com.example.app.domain.ReviewLike;
import com.example.app.domain.ReviewLikeId;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewLikeRepository extends JpaRepository<ReviewLike, ReviewLikeId> {
    ReviewLike findByUserAndReview(User user, Review review);
    boolean existsByUser(User user);
    long countByReviewId(Integer reviewId);

    @Query("SELECT rl.review.id AS reviewId, COUNT(rl) AS likeCountLong " +
            "FROM ReviewLike rl WHERE rl.review.id IN :reviewIds GROUP BY rl.review.id")
    List<ReviewLikeCount> countLikesByReviewIds(@Param("reviewIds") List<Integer> reviewIds);

    interface ReviewLikeCount {
        Integer getReviewId();
        Long getLikeCountLong();

        default Integer getLikeCount() {
            Long count = getLikeCountLong();
            return count == null ? 0 : count.intValue();
        }
    }
}
