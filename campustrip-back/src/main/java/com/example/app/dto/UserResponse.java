package com.example.app.dto;

import com.example.app.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    public UserResponse(User user){
        this.id = user.getId();
        this.name = user.getName();
        this.gender = user.getGender();
        this.userId = user.getUserId();
        this.phoneNumber = user.getPhoneNumber();
        this.email = user.getEmail();
        this.schoolEmail = user.getSchoolEmail();
        this.description = user.getDescription();
        this.preference = user.getPreference();
        this.userScore = user.getUserScore();
        this.role = user.getRole();
        this.profilePhotoUrl = user.getProfilePhotoUrl();
    }
    private Integer id;
    private String name;
    private String gender;
    private String userId;
    private String phoneNumber;
    private String email;
    private String schoolEmail;
    private String description;
    private Integer preference;
    private Float userScore;
    private Integer role;
    private String profilePhotoUrl;
}
