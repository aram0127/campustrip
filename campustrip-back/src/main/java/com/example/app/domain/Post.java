package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Set;
import java.util.HashSet;

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
    private Integer postId;

    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User user;

    @Column(name="title", nullable=false, length=100)
    private String title;

    @Column(name="body", nullable=false, columnDefinition="TEXT")
    private String body;

    @Column(name="created_at", nullable=false)
    private java.time.LocalDateTime createdAt = java.time.LocalDateTime.now();

    @Column(name="updated_at")
    private java.time.LocalDateTime updatedAt;

    @Column(name="team_size", nullable=false)
    private Integer teamSize = 0;

    @ManyToMany
    @JoinTable(
        name = "PostRegion",
        joinColumns = @JoinColumn(name = "post_id"),
        inverseJoinColumns = @JoinColumn(name = "region_id")
    )
    private Set<Region> regions = new HashSet<>();

    @JsonManagedReference("post-applications")
    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.Set<Application> applications = new java.util.HashSet<>();

    @OneToOne
    @JoinColumn(name="chat_id", nullable=false)
    private Chat chat;

    @ManyToOne
    @JoinColumn(name="planner_id", nullable=false)
    private Planner planner;

    @Column(name="start_at")
    private java.time.LocalDate startAt;

    @Column(name="end_at")
    private java.time.LocalDate endAt;

    // 기본 생성자, getter, setter 생략
}
