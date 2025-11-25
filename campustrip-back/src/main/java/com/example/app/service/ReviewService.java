package com.example.app.service;

import com.example.app.domain.Review;
import com.example.app.dto.ReviewDTO;
import com.example.app.repository.ReviewAssetRepository;
import com.example.app.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewAssetRepository reviewAssetRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, ReviewAssetRepository reviewAssetRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewAssetRepository = reviewAssetRepository;
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
}
