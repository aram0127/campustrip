package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;


@Entity
@Table(name="PostRegion")
@IdClass(PostRegion.PostRegionId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PostRegion {
    @Id
    @ManyToOne
    @JoinColumn(name="region_id", nullable=false)
    @JsonBackReference("postRegion-region")  // 고유 이름 지정
    private Region regionId;

    @Id
    @ManyToOne
    @JoinColumn(name="post_id", nullable=false)
    @JsonBackReference("post-applications")  // 고유 이름 지정
    private Post postId;

    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PostRegionId implements Serializable {
        private Integer regionId;
        private Integer postId;
    }
}
