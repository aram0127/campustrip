package com.example.app.controller;

import com.example.app.dto.CreateReview;
import com.example.app.dto.ReviewDTO;
import com.example.app.service.ReviewService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    // 리뷰를 ID로 조회
    @GetMapping("/{id}")
    public ReviewDTO getReviewById(@PathVariable Integer id) {
        return reviewService.getReviewById(id);
    }

    // 모든 리뷰 조회
    @GetMapping("/")
    public List<ReviewDTO> getAllReviews() {
        return reviewService.getAllReviews();
    }

    // 리뷰 생성
    @PostMapping("/")
    public ReviewDTO createReview(@RequestBody CreateReview createReview) {
        return reviewService.createReview(createReview);
    }

    // 리뷰 수정
    @PutMapping("/{id}")
    public ReviewDTO updateReview(@PathVariable Integer id, @RequestBody CreateReview createReview) {
        return reviewService.updateReview(id, createReview);
    }

    // 리뷰에 좋아요
    @PostMapping("/{id}/like")
    public void likeReview(@PathVariable Integer id, @AuthenticationPrincipal String userId) {
        // @AuthenticationPrincipal 어노테이션을 사용하여 현재 로그인한 사용자의 ID를 가져올 수 있습니다.
        reviewService.likeReview(id, userId);
    }

    // 리뷰 좋아요 취소
    @PostMapping("/{id}/unlike")
    public void unlikeReview(@PathVariable Integer id, @AuthenticationPrincipal String userId) {
        // @AuthenticationPrincipal 어노테이션을 사용하여 현재 로그인한 사용자의 ID를 가져올 수 있습니다.
        reviewService.unlikeReview(id, userId);
    }

    // 리뷰에 댓글 추가
    @PostMapping("/{id}/comment")
    public void addComment(@PathVariable Integer id, @AuthenticationPrincipal String userId, @RequestParam String comment) {
        reviewService.addComment(id, userId, comment);
    }

    @PutMapping("/{id}/comment/{commentId}")
    public void updateComment(@PathVariable Integer id, @PathVariable Integer commentId, @AuthenticationPrincipal String userId, @RequestParam String comment) {
        // 로그인한 사용자가 자신의 댓글만 수정할 수 있도록 검증 로직이 필요할 수 있습니다.
        reviewService.updateComment(id, commentId, userId, comment);
    }

    // 리뷰 댓글 삭제
    @DeleteMapping("/{id}/comment/{commentId}")
    public void deleteComment(@PathVariable Integer id, @PathVariable Integer commentId, @AuthenticationPrincipal String userId) {
        // 로그인한 사용자가 자신의 댓글만 삭제할 수 있도록 검증 로직이 필요할 수 있습니다.
        reviewService.deleteComment(id, commentId, userId);
    }
}
