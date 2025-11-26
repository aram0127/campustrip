package com.example.app.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="ReviewLike")
@IdClass(ReviewLikeId.class)
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ReviewLike {
    @Id
    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User user;

    @Id
    @ManyToOne
    @JoinColumn(name="review_id", nullable=false)
    private Review review;
}
