package com.example.app.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "PostAsset")
@IdClass(PostAssetId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostAsset {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "asset_id")
    private Integer assetId;

    // 복합 PK의 두번째 필드 — 숫자 형태로 저장
    @Id
    @Column(name = "post_id", nullable = false)
    private Integer postId;

    // 연관관계는 읽기 전용으로 매핑
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", insertable = false, updatable = false)
    private Post post;

    @Column(name = "storage_url", nullable = false, length = 255)
    private String storgeUrl;

    @Column(name = "file_size", nullable = false)
    private Integer fileSize = 0;

    public PostAsset(Post newPost, String imageUrl) {
        this.post = newPost;
        this.postId = newPost.getPostId();
        this.storgeUrl = imageUrl;
    }
}
