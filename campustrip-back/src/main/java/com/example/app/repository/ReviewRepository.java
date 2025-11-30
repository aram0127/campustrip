package com.example.app.repository;

import com.example.app.domain.Review;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReviewRepository extends JpaRepository<Review, Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    // 최신순 조회 + 검색
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT r FROM Review r WHERE (:keyword IS NULL OR :keyword = '' OR r.title LIKE %:keyword% OR r.body LIKE %:keyword%)")
    Slice<Review> findSliceByKeyword(@Param("keyword") String keyword, Pageable pageable);

    // 좋아요순 조회 + 검색
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT r FROM Review r LEFT JOIN ReviewLike rl ON r = rl.review " +
            "WHERE (:keyword IS NULL OR :keyword = '' OR r.title LIKE %:keyword% OR r.body LIKE %:keyword%) " +
            "GROUP BY r " +
            "ORDER BY COUNT(rl) DESC, r.createdAt DESC")
    Slice<Review> findSliceByKeywordOrderByLikes(@Param("keyword") String keyword, Pageable pageable);

    // 사용자별 최신/기본 조회 (정렬은 Pageable에 위임)
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT r FROM Review r WHERE r.user.id = :userId")
    Slice<Review> findSliceByUserId(@Param("userId") Integer userId, Pageable pageable);

    // 사용자별 좋아요순 조회
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT r FROM Review r LEFT JOIN ReviewLike rl ON r = rl.review " +
            "WHERE r.user.id = :userId " +
            "GROUP BY r " +
            "ORDER BY COUNT(rl) DESC, r.createdAt DESC")
    Slice<Review> findSliceByUserIdOrderByLikes(@Param("userId") Integer userId, Pageable pageable);
}