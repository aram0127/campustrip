package com.example.app.service;

import com.example.app.repository.ReviewAssetRepository;
import com.example.app.repository.ReviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ReviewService {
    private final ReviewRepository reviewRepository;
    private final ReviewAssetRepository reviewAssetRepository;

    @Autowired
    public ReviewService(ReviewRepository reviewRepository, ReviewAssetRepository reviewAssetRepository) {
        this.reviewRepository = reviewRepository;
        this.reviewAssetRepository = reviewAssetRepository;
    }


    // 이미지받아서 ec2에 올리고 url을 reviewAsset에 저장하는 메서드들 작성 예정
}
