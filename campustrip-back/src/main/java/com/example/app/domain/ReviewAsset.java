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
    @Column(name = "asset_id")
    private Integer assetId;

    @Id
    @Column(name = "review_id", nullable = false)
    private Integer reviewId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "review_id", insertable = false, updatable = false)
    private Review review;

    @Column(name = "storage_url", nullable = false, length = 255)
    private String storageUrl;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize = 0;
}
