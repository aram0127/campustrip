package com.example.app.controller;

import com.example.app.dto.SchoolEmailDTO;
import com.example.app.dto.UserResponse;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.app.service.UserService;
import com.example.app.domain.User;
import com.example.app.dto.CreateUserRequest;
import java.util.List;
import java.util.stream.Collectors;

@RestController  // REST API용 컨트롤러
@RequestMapping("/api/users")  // 기본 URL 경로
public class UserController {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    // GET: 전체 사용자 조회
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserResponse> getAllUsers() {
        return userService.getAllUsers().stream()
                .map(user -> new UserResponse(user))
                .collect(Collectors.toList());
    }

    // GET: ID로 사용자 조회
    @GetMapping("/{id}")
    public User getUserById(@PathVariable Integer id) {
        return userService.getUserById(id);
    }

    // POST: 새 사용자 생성
    @PostMapping
    public UserResponse createUser(@RequestBody CreateUserRequest request) {
        request.setPasswordEncoder(passwordEncoder);
        User user = request.toEntity();
        userService.saveUser(user);
        return new UserResponse(user);
    }

    // PUT: 사용자 정보 수정 // id가 뭘 의미하는지 다시 보자
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public User updateUser(@PathVariable String id, @RequestBody User user) {
        user.setUserId(id);
        userService.saveUser(user);
        return user;
    }

    // DELETE: 사용자 삭제
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
    }

    @PostMapping("/school-email")
    public SchoolEmailDTO getSchoolEmail(@PathVariable SchoolEmailDTO email) {
        if(email.getSchoolEmail().endsWith(".ac.kr")) {
            return email;
        }
        return null;
    }
}