package com.example.app.dto;

import com.example.app.domain.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CreateUserRequest {
    private BCryptPasswordEncoder passwordEncoder;
    private String name;
    private String password;
    private String userId;
    private String phoneNumber;
    private String email;
    private String schoolEmail;

    public User toEntity() {
        String encodedPassword = passwordEncoder.encode(password);
        return new User(null, name, encodedPassword, userId, phoneNumber, email, schoolEmail, null, 0, 36.5F, 1);
    }

}
