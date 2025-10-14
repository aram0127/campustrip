package com.example.app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="Post")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="post_id")
    private Integer post_id;

    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User membership_id;

    @Column(name="title", nullable=false, length=100)
    private String title;

    @Column(name="body", nullable=false, columnDefinition="TEXT")
    private String body;

    @Column(name="created_at", nullable=false)
    private java.time.LocalDateTime created_at = java.time.LocalDateTime.now();

    @Column(name="updated_at")
    private java.time.LocalDateTime updated_at;

    @Column(name="team_size", nullable=false)
    private Integer team_size = 0;

    @OneToOne
    @JoinColumn(name="chat_id", nullable=false)
    private Chat chat;

    @OneToOne
    @JoinColumn(name="planner_id", nullable=false)
    private Planner planner;

    // 기본 생성자, getter, setter 생략
}
