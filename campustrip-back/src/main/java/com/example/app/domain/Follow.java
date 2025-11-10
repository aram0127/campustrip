package com.example.app.domain;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Table(name="Follow")
@Getter
@Setter
@AllArgsConstructor
public class Follow {
    @EmbeddedId
    private FollowId id;

    @MapsId("membershipId")
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="membership_id", nullable=false)
    private User membership;

    @MapsId("targetId")
    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="target_id", nullable=false)
    private User target;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    public Follow() {
        this.createdAt = LocalDateTime.now();
    }

    @Embeddable
    @EqualsAndHashCode
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FollowId implements Serializable {
        private Integer membershipId;
        private Integer targetId;
    }
}
