package com.example.app.repository;

import com.example.app.domain.PostAsset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostAssetrepository extends JpaRepository<PostAsset, Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count
}
