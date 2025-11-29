package com.example.app.domain;


import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name="Comment")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="comment_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User user;

    @ManyToOne
    @JoinColumn(name="review_id", nullable=false)
    private Review review;

    @Column(name="body", nullable=false, columnDefinition="TEXT")
    private String body;

    @Column(name="created_at", nullable=false)
    private LocalDateTime createdAt;
}
