package com.example.app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name="User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="membership_id")
    private Integer membership_id;
    @Column(name="name", nullable=false, length=50)
    private String name;
    @Column(name="password", nullable=false, length=50)
    private String password;
    @Column(name="user_id", nullable=false, length=50)
    private String user_id;
    @Column(name="phone_number", length=50)
    private String phone_number;
    @Column(name="email", nullable=false, length=50)
    private String email;
    @Column(name="school_email", nullable=false, length=50)
    private String school_email;
    @Column(name="mbti", length=50)
    private String mbti;
    @Column(name="preference")
    private Integer preference;
    @Column(name="user_score", nullable=false)
    private Float user_score = 36.5F;

    // 기본 생성자, getter, setter 생략
}