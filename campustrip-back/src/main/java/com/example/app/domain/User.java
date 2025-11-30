package com.example.app.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="membership_id")
    private Integer id;
    @Column(name="name", nullable=false, length=50)
    private String name;
    @Column(name="gender", length=50)
    private String gender;
    @Column(name="password", nullable=false, length=100)
    private String password;
    @Column(name="user_id", nullable=false, length=50)
    private String userId;
    @Column(name="phone_number", length=50)
    private String phoneNumber;
    @Column(name="email", length=50)
    private String email;
    @Column(name="school_email", nullable=false, length=50)
    private String schoolEmail;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="university_id", nullable=false)
    private Universities university;
    @Column(name="description", length=50)
    private String description;
    @Column(name="preference")
    private Integer preference;
    @Column(name="user_score", nullable=false)
    private Float userScore = 36.5F;
    @Column(name="role", nullable=false, length=20)
    private Integer role = 1;
    @Column(name="profile_photo_url", length=200)
    private String profilePhotoUrl;
    @JsonManagedReference("user-chatMembers")  // 정방향 참조 (JSON에 포함)
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private java.util.List<ChatMember> chatMembers = new java.util.ArrayList<>();
    @JsonManagedReference("user-applications")
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<Application> applications = new java.util.ArrayList<>();

    public User(String name, String gender, String encodedPassword, String userId, String phoneNumber, String email, String schoolEmail) {
        this.name = name;
        this.gender = gender;
        this.password = encodedPassword;
        this.userId = userId;
        this.phoneNumber = phoneNumber;
        this.email = email;
        this.schoolEmail = schoolEmail;
    }

    public void setRole(String role) {
        this.role = "ROLE_ADMIN".equals(role) ? 0 : 1;
    }
    public void setScore(Integer score) {
        this.userScore = 36.5F + (float)(score * 0.5);
    }
    // 기본 생성자, getter, setter 생략
}