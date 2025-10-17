package com.example.app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="Application")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="application_id")
    private Integer id;

    @ManyToOne
    @JoinColumn(name="post_id", nullable=false)
    private Post post;

    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    private User user;

    @Column(name="state")
    private Boolean applicationStatus = false;

    @Column(name="application_date", nullable=false)
    private java.time.LocalDateTime applicationDate = java.time.LocalDateTime.now();
    // 기본 생성자, getter, setter 생략

    public String getUserId() {
        return user.getUserId();
    }
}