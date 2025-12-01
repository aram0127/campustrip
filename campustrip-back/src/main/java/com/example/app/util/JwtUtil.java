package com.example.app.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long accessTokenExpiredMs = 1000 * 60 * 60; // 1시간
    private final long refreshTokenExpiredMs = 1000 * 60 * 60 * 24 * 7; // 7일

    // Access Token 생성
    public String createAccessToken(String username, Integer membershipId, String name, String role) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + accessTokenExpiredMs);

        return Jwts.builder()
                .claim("username", username)
                .claim("membershipId", membershipId)
                .claim("name", name)
                .claim("role", role)
                .claim("type", "access")
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(secretKey)
                .compact();
    }

    // Refresh Token 생성
    public String createRefreshToken() {
        return UUID.randomUUID().toString();
    }

    public long getRefreshTokenExpiredMs() {
        return refreshTokenExpiredMs;
    }

    // 토큰에서 사용자명 추출
    public String getUsername(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token)
                .getPayload()
                .get("username", String.class);
    }

    // 토큰에서 membershipId 추출
    public Integer getMembershipId(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token)
                .getPayload()
                .get("membershipId", Integer.class);
    }

    // 토큰에서 실명 추출
    public String getName(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token)
                .getPayload()
                .get("name", String.class);
    }

    // 토큰에서 역할 추출
    public String getRole(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token)
                .getPayload()
                .get("role", String.class);
    }

    // 토큰 유효성 검증
    public Boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // 토큰 만료 여부 확인
    public Boolean isExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseClaimsJws(token)
                .getPayload()
                .getExpiration();
        return expiration.before(new Date());
    }
}
