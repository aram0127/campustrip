package com.example.app.controller;

import com.example.app.domain.Universities;
import com.example.app.dto.*;
import com.example.app.repository.UniversitiesRepository;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.example.app.service.UserService;
import com.example.app.domain.User;

import java.util.List;
import java.util.stream.Collectors;

@RestController  // REST API용 컨트롤러
@RequestMapping("/api/users")  // 기본 URL 경로
public class UserController {
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    private final UserService userService;
    private final UniversitiesRepository universitiesRepository;

    @Autowired
    public UserController(UserService userService, UniversitiesRepository universitiesRepository) {
        this.userService = userService;
        this.universitiesRepository = universitiesRepository;
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
    public UserResponse getUserById(@PathVariable Integer id) {
        return new UserResponse(userService.getUserById(id));
    }

    // POST: 새 사용자 생성
    @PostMapping
    public UserResponse createUser(@RequestBody CreateUserRequest request) {
        request.setPasswordEncoder(passwordEncoder);
        User user = request.toEntity();
        user.setUniversity(universitiesRepository.findByName(request.getUniversityName()));
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

    // 학교 이메일 도메인 확인
    @PostMapping("/school-email")
    public SchoolEmailDTO getSchoolEmail(@PathVariable SchoolEmailDTO email) {
        if(email.getSchoolEmail().endsWith(".ac.kr")) { // 데이터베이스 조회 로직 추가 필요
            return email;
        }
        return null;
    }

    // 사용자 선호도 수정
    @PutMapping("/preference/{id}")
    @PreAuthorize("hasRole('ADMIN') or #id == authentication.principal.id")
    public User updateUserPreference(@PathVariable Integer id, @RequestBody UserPreference user) {
        User existingUser = userService.getUserById(id);
        existingUser.setPreference(user.getPreference());
        userService.saveUser(existingUser);
        return existingUser;
    }

    // 사용자 평가 남기기
    @PutMapping("/{id}/rate")
    public void rateUser(@PathVariable Integer id, @AuthenticationPrincipal String userId, @RequestBody CreateUserRate rate) {
        userService.rateUser(userId, rate);
    }

    // 내가 평가한 사람 조회
    @GetMapping("/{id}/rated-users")
    public List<UserRateDTO> getRatedUsers(@PathVariable Integer id) {
        return userService.getUserRatesByRaterId(id);
    }
}