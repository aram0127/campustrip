package com.example.app.repository;

import com.example.app.domain.PostAsset;
import com.example.app.domain.PostAssetId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostAssetRepository extends JpaRepository<PostAsset, PostAssetId> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count
}
