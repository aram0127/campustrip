package com.example.app.domain;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Table(name="User")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="membership_id")
    private Integer id;
    @Column(name="name", nullable=false, length=50)
    private String name;
    @Column(name="password", nullable=false, length=50)
    private String password;
    @Column(name="user_id", nullable=false, length=50)
    private String userId;
    @Column(name="phone_number", length=50)
    private String phoneNumber;
    @Column(name="email", nullable=false, length=50)
    private String email;
    @Column(name="school_email", nullable=false, length=50)
    private String schoolEmail;
    @Column(name="mbti", length=50)
    private String mbti;
    @Column(name="preference")
    private Integer preference;
    @Column(name="user_score", nullable=false)
    private Float userScore = 36.5F;
    @Column(name="role", nullable=false, length=20)
    private Integer role = 1;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        String role = this.role == 1 ? "ROLE_USER" : "ROLE_ADMIN";
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getUsername() {
        return name;
    }

    public void setRole(String role) {
        this.role = role == "ROLE_ADMIN" ? 0 : 1;
    }

    // 기본 생성자, getter, setter 생략
}