package com.example.app.service;

import com.example.app.domain.*;
import com.example.app.dto.CreateReview;
import com.example.app.dto.ReviewDTO;
import com.example.app.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewAssetRepository reviewAssetRepository;
    private final S3Service s3Service;
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final ReviewLikeRepository reviewLikeRepository;
    private final CommentRepository commentRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, ReviewAssetRepository reviewAssetRepository, S3Service s3Service, PostRepository postRepository, UserRepository userRepository, ReviewLikeRepository reviewLikeRepository, CommentRepository commentRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewAssetRepository = reviewAssetRepository;
        this.s3Service = s3Service;
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.reviewLikeRepository = reviewLikeRepository;
        this.commentRepository = commentRepository;
    }

    public ReviewDTO getReviewById(Integer id) {
        Review review = reviewRepository.findById(id).orElse(null);
        if (review == null) {
            return null; // 또는 예외 처리
        }
        ReviewDTO reviewDTO = new ReviewDTO(review);
        List<String> assetList = new ArrayList<>();
        reviewAssetRepository.findAllByReviewId(id).forEach(asset -> {
            assetList.add(asset.getStorageUrl());
        });
        reviewDTO.setImageUrls(assetList);
        return reviewDTO;
    }

    public List<ReviewDTO> getAllReviews() {
        List<Review> reviews = reviewRepository.findAll();
        List<ReviewDTO> reviewDTOs = new ArrayList<>();
        for (Review review : reviews) {
            ReviewDTO reviewDTO = new ReviewDTO(review);
            List<String> assetList = new ArrayList<>();
            reviewAssetRepository.findAllByReviewId(review.getId()).forEach(asset -> {
                assetList.add(asset.getStorageUrl());
            });
            reviewDTO.setImageUrls(assetList);
            reviewDTOs.add(reviewDTO);
        }
        return reviewDTOs;
    }

    public ReviewDTO createReview(CreateReview reviewDTO) {
        // 1. Review 엔티티 생성 및 저장
        Review review = reviewDTO.toEntity();
        User user = userRepository.findById(reviewDTO.getUserId()).orElse(null);
        if (user == null) {
            return null; // 또는 예외 처리
        }
        review.setUser(user);
        Post post = postRepository.findById(reviewDTO.getPostId()).orElse(null);
        if (post == null) {
            return null; // 또는 예외 처리
        }
        review.setPost(post);
        Review savedReview = reviewRepository.save(review);
        // 2. 첨부 이미지 파일 처리 및 ReviewAsset 엔티티 저장
        uploadReviewAssets(savedReview, reviewDTO.getImages());
        return new ReviewDTO(savedReview);
    }

    public ReviewDTO updateReview(Integer id, CreateReview createReview) {
        Review existingReview = reviewRepository.findById(id).orElse(null);
        if (existingReview == null) {
            return null; // 또는 예외 처리
        }
        existingReview.setTitle(createReview.getTitle());
        existingReview.setBody(createReview.getBody());
        existingReview.setUpdatedAt(java.time.LocalDateTime.now());
        Review updatedReview = reviewRepository.save(existingReview);
//        Iterable<ReviewAsset> reviewAsset = reviewAssetRepository.findAllByReviewId(id);
        reviewAssetRepository.findAllByReviewId(id).forEach(asset -> {
            s3Service.deleteFile(asset.getStorageUrl());
            reviewAssetRepository.delete(asset);
        });
        // 새로운 이미지 업로드 및 ReviewAsset 저장
        uploadReviewAssets(updatedReview, createReview.getImages());
        return new ReviewDTO(updatedReview);
    }

    private boolean uploadReviewAssets(Review review, List<MultipartFile> images) {
        for (var image : images) {
            try {
                String imageUrl = s3Service.uploadFile(image);
                ReviewAsset reviewAsset = new ReviewAsset();
                reviewAsset.setReview(review);
                reviewAsset.setStorageUrl(imageUrl);
                reviewAssetRepository.save(reviewAsset);
            } catch (Exception e) {
                e.printStackTrace();
                // 파일 업로드 실패 시의 처리 로직 추가 가능
            }
        }
        return true;
    }

    public boolean likeReview(Integer reviewId, String userId) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) {
            return false; // 또는 예외 처리
        }
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false; // 또는 예외 처리
        }
        // 이미 좋아요가 눌렸는지 확인
        ReviewLike existingLike = reviewLikeRepository.findByUserAndReview(user, review);
        if (existingLike != null) {
            return false; // 이미 좋아요가 눌린 상태이므로 아무 작업도 하지 않음
        }
        // 좋아요 저장
        reviewLikeRepository.save(new ReviewLike(user, review));
        return true;
    }

    public boolean unlikeReview(Integer reviewId, String userId) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) {
            return false; // 또는 예외 처리
        }
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false; // 또는 예외 처리
        }
        // 기존 좋아요 엔티티 조회
        ReviewLike existingLike = reviewLikeRepository.findByUserAndReview(user, review);
        if (existingLike != null) {
            reviewLikeRepository.delete(existingLike);
            return true;
        }
        return false;
    }

    public boolean addComment(Integer reviewId, String userId, String comment) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) {
            return false; // 또는 예외 처리
        }
        Review review = reviewRepository.findById(reviewId).orElse(null);
        if (review == null) {
            return false; // 또는 예외 처리
        }
        Comment reviewComment = new Comment();
        reviewComment.setReview(review);
        reviewComment.setUser(user);
        reviewComment.setBody(comment);
        // CommentRepository를 통해 댓글 저장
        commentRepository.save(reviewComment);
        return true;
    }

    public boolean updateComment(Integer reviewId, Integer commentId, String userId, String comment) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) {
            return false; // 또는 예외 처리
        }
        Comment existingComment = commentRepository.findById(commentId).orElse(null);
        if (existingComment == null || !existingComment.getUser().getId().equals(user.getId())) {
            return false; // 또는 예외 처리
        }
        existingComment.setBody(comment);
        commentRepository.save(existingComment);
        return true;
    }

    public boolean deleteComment(Integer reviewId, Integer commentId, String userId) {
        User user = userRepository.findByUserId(userId).orElse(null);
        if (user == null) {
            return false; // 또는 예외 처리
        }
        Comment existingComment = commentRepository.findById(commentId).orElse(null);
        if (existingComment == null || !existingComment.getUser().getId().equals(user.getId())) {
            return false; // 또는 예외 처리
        }
        commentRepository.delete(existingComment);
        return true;
    }
}
