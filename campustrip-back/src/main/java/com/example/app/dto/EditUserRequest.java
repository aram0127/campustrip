package com.example.app.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter @Setter
@NoArgsConstructor
@AllArgsConstructor
public class EditUserRequest {
    private String name;
    private String gender;
    private String phoneNumber;
    private String email;
    private String schoolEmail;
    private String universityName;
    private String description;
}
