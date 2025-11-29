package com.example.app.service;

import com.example.app.domain.FCMToken;
import com.example.app.repository.FCMTokenRepository;
import com.example.app.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class FCMTokenService {

    private final FCMTokenRepository fcmTokenRepository;
    private final UserRepository userRepository;

    // 토큰 저장
    public void saveToken(Integer membershipId, String token) {
        // 사용자 존재 확인
        if (!userRepository.existsById(membershipId)) {
            throw new IllegalArgumentException("User not found: " + membershipId);
        }

        // 중복 체크
        if (!fcmTokenRepository.existsByMembershipIdAndToken(membershipId, token)) {
            FCMToken fcmToken = new FCMToken();
            fcmToken.setMembershipId(membershipId);
            fcmToken.setToken(token);
            fcmTokenRepository.save(fcmToken);
        }
    }

    // 사용자의 모든 토큰 조회
    @Transactional(readOnly = true)
    public List<String> getTokensByMembershipId(Integer membershipId) {
        return fcmTokenRepository.findByMembershipId(membershipId)
                .stream()
                .map(FCMToken::getToken)
                .collect(Collectors.toList());
    }

    // 특정 토큰 삭제 (유효하지 않은 토큰 처리)
    public void deleteToken(String token) {
        fcmTokenRepository.deleteByToken(token);
    }

    // 사용자의 모든 토큰 삭제 (로그아웃 시)
    public void deleteAllUserTokens(Integer membershipId) {
        fcmTokenRepository.deleteByMembershipId(membershipId);
    }
}
