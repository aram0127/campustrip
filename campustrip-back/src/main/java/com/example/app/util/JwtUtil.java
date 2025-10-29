package com.example.app.util;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtil {

    private final SecretKey secretKey = Keys.secretKeyFor(SignatureAlgorithm.HS256);
    private final long expiredMs = 1000 * 60 * 60; // 1시간

    // JWT 토큰 생성
    public String createToken(String username, Integer membershipId, String name, String role) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + expiredMs);

        return Jwts.builder()
                .claim("username", username)
                .claim("membershipId", membershipId) // membership_id 추가
                .claim("name", name) // name 추가
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(secretKey)
                .compact();
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
