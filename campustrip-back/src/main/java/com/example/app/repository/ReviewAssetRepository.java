package com.example.app.repository;

import com.example.app.domain.ReviewAsset;
import com.example.app.domain.ReviewAssetId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewAssetRepository extends JpaRepository<ReviewAsset, ReviewAssetId> {
    Iterable<ReviewAsset> findAllByReviewId(Integer id);
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count
}
