package com.example.app.controller;

import com.example.app.dto.*;
import com.example.app.enumtype.PushNotificationType;
import com.example.app.service.FCMService;
import com.example.app.service.ReviewService;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
    private final ReviewService reviewService;
    private final FCMService fcmService;

    public ReviewController(ReviewService reviewService, FCMService fcmService) {
        this.reviewService = reviewService;
        this.fcmService = fcmService;
    }

    // 리뷰를 ID로 조회
    @GetMapping("/{id}")
    public ReviewDTO getReviewById(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        return reviewService.getReviewById(id, userDetails.getUsername());
    }

    // 전체 리뷰 조회
    @GetMapping("/")
    public Slice<ReviewDTO> getAllReviews(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        // 프론트에서 ?sort=likes 로 요청하면 Pageable의 sort에 "likes"가 들어감
        return reviewService.getReviewSlice(keyword, pageable);
    }

    // 작성자의 리뷰들 조회
    @GetMapping("/user/{userId}")
    public Slice<ReviewDTO> getReviewsByUserId(
            @RequestParam Integer userId,
            @PageableDefault(size=5, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return reviewService.getReviewsByUserId(userId, pageable);
    }

    // 리뷰 생성
    @PostMapping(value = "/", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ReviewDTO createReview(@ModelAttribute CreateReview createReview) {
        return reviewService.createReview(createReview);
    }

    // 리뷰 수정
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ReviewDTO updateReview(@PathVariable Integer id, @ModelAttribute CreateReview createReview) {
        return reviewService.updateReview(id, createReview);
    }

    // 리뷰 삭제
    @DeleteMapping("/{id}")
    public void deleteReview(@PathVariable Integer id) {
        reviewService.deleteReview(id);
    }

    // 리뷰에 좋아요
    @PostMapping("/{id}/like")
    public void likeReview(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        // @AuthenticationPrincipal 어노테이션을 사용하여 현재 로그인한 사용자의 ID를 가져올 수 있습니다.
        reviewService.likeReview(id, userDetails.getUsername());
    }

    // 리뷰 좋아요 취소
    @PostMapping("/{id}/unlike")
    public void unlikeReview(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        // @AuthenticationPrincipal 어노테이션을 사용하여 현재 로그인한 사용자의 ID를 가져올 수 있습니다.
        reviewService.unlikeReview(id, userDetails.getUsername());
    }

    // 리뷰의 댓글들 조회
    @GetMapping("/{id}/comment")
    public List<CommentDTO> getCommentsByReviewId(@PathVariable Integer id) {
        return reviewService.getCommentsByReviewId(id);
    }

    // 리뷰에 댓글 추가
    @PostMapping("/{id}/comment")
    public void addComment(@PathVariable Integer id, @AuthenticationPrincipal CustomUserDetails userDetails, @RequestParam String comment) {
        System.out.println("Adding comment to review ID: " + id + " by user: " + userDetails.getUsername() + " Comment: " + comment);
        reviewService.addComment(id, userDetails.getUsername(), comment);
        // 댓글 달렸다는 알림 작성자에게 전송
        fcmService.sendNotificationToUser(
            new PushNotificationRequest(
                    reviewService.getReviewAuthorId(id),//알림받는 상대방
                    userDetails.getMembershipId(),
                    PushNotificationType.REVIEW_COMMENT,
                    id,
                    "새로운 댓글이 등록되었습니다.",
                    userDetails.getUsername() + "님이 회원님의 리뷰에 댓글을 남겼습니다."
            )
        );
    }

    // 리뷰 댓글 수정
    @PutMapping("/{id}/comment/{commentId}")
    public void updateComment(@PathVariable Integer id, @PathVariable Integer commentId, @AuthenticationPrincipal CustomUserDetails userDetails, @RequestParam String comment) {
        // 로그인한 사용자가 자신의 댓글만 수정할 수 있도록 검증 로직이 필요할 수 있습니다.
        reviewService.updateComment(id, commentId, userDetails.getUsername(), comment);
    }

    // 리뷰 댓글 삭제
    @DeleteMapping("/{id}/comment/{commentId}")
    public void deleteComment(@PathVariable Integer id, @PathVariable Integer commentId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        // 로그인한 사용자가 자신의 댓글만 삭제할 수 있도록 검증 로직이 필요할 수 있습니다.
        reviewService.deleteComment(id, commentId, userDetails.getUsername());
    }
}
