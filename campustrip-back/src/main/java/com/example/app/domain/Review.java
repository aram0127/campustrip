package com.example.app.domain;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name="Review")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="review_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User user;

    @Column(name="title", nullable=false, length=100)
    private String title;

    @Column(name="body", nullable=false, columnDefinition="TEXT")
    private String body;

    @Column(name="created_at", nullable=false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name="updated_at", nullable=false)
    private java.time.LocalDateTime updatedAt = java.time.LocalDateTime.now();

    @OneToOne
    @JoinColumn(name="post_id", nullable=false)
    private Post post;
}
