package com.example.app.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "ReviewAsset")
@IdClass(ReviewAssetId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReviewAsset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Integer assetId;

    // 복합 PK의 두번째 필드 — 숫자 형태로 저장
    @Id
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;

    // 연관관계는 읽기 전용으로 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", insertable = false, updatable = false)
    private Review review;

    @Column(name = "storage_url", nullable = false, length = 255)
    private String storgeUrl;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize = 0;
}
