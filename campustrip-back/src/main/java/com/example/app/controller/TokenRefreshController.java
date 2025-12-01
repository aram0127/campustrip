package com.example.app.controller;

import com.example.app.domain.RefreshToken;
import com.example.app.domain.User;
import com.example.app.repository.UserRepository;
import com.example.app.service.RefreshTokenService;
import com.example.app.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class TokenRefreshController {

    private final RefreshTokenService refreshTokenService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public TokenRefreshController(RefreshTokenService refreshTokenService,
                                  JwtUtil jwtUtil, UserRepository userRepository) {
        this.refreshTokenService = refreshTokenService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        return refreshTokenService.findByToken(refreshToken)
                .map(token -> {
                    if (!refreshTokenService.verifyExpiration(token)) {
                        return ResponseEntity.status(401).body("Refresh token expired");
                    }

                    User user = userRepository.findByUserId(token.getUserId())
                            .orElseThrow(() -> new RuntimeException("User not found"));

                    String roleString = user.getRole() == 1 ? "ROLE_ADMIN" : "ROLE_USER";

                    String newAccessToken = jwtUtil.createAccessToken(
                            user.getUserId(),
                            user.getId(),
                            user.getName(),
                            roleString
                    );

                    Map<String, String> response = new HashMap<>();
                    response.put("accessToken", newAccessToken);
                    response.put("refreshToken", refreshToken);

                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.status(401).body("Invalid refresh token"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        refreshTokenService.deleteByUserId(userId);
        return ResponseEntity.ok("Logged out successfully");
    }
}
