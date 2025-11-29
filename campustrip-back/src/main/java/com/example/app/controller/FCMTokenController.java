package com.example.app.controller;

import com.example.app.service.FCMTokenService;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/fcm/token")
@RequiredArgsConstructor
public class FCMTokenController {

    private final FCMTokenService tokenService;

    @PostMapping
    public ResponseEntity<?> registerToken(@RequestBody TokenRequest request) {
        tokenService.saveToken(request.getMembershipId(), request.getToken());
        return ResponseEntity.ok(Map.of("success", true, "message", "Token registered"));
    }

    @DeleteMapping
    public ResponseEntity<?> deleteToken(@RequestParam String token) {
        tokenService.deleteToken(token);
        return ResponseEntity.ok(Map.of("success", true, "message", "Token deleted"));
    }

    @DeleteMapping("/user/{membershipId}")
    public ResponseEntity<?> deleteAllUserTokens(@PathVariable Integer membershipId) {
        tokenService.deleteAllUserTokens(membershipId);
        return ResponseEntity.ok(Map.of("success", true, "message", "All tokens deleted"));
    }

    @Getter
    @Setter
    public static class TokenRequest {
        private Integer membershipId;
        private String token;
    }
}
