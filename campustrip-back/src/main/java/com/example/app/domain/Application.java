package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="Application")
@IdClass(ApplicationId.class)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Application {
    @Id
    @ManyToOne
    @JoinColumn(name="post_id", nullable=false)
    @JsonBackReference("post-applications")  // 고유 이름 지정
    private Post post;

    @Id
    @ManyToOne
    @JoinColumn(name="membership_id", nullable=false)
    @JsonBackReference("user-applications")  // 고유 이름 지정
    private User user;

    @Column(name="state")
    private Boolean applicationStatus;

    @Column(name="application_date", nullable=false)
    private java.time.LocalDateTime applicationDate = java.time.LocalDateTime.now();

    public String getUserId() {
        return user.getUserId();
    }
}