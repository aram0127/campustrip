package com.example.app.util;

import com.example.app.dto.CustomUserDetails;
import com.example.app.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.Iterator;

public class LoginFilter extends UsernamePasswordAuthenticationFilter {

    private static final Logger logger = LoggerFactory.getLogger(LoginFilter.class);

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;

    public LoginFilter(AuthenticationManager authenticationManager, JwtUtil jwtUtil) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Authentication attemptAuthentication(HttpServletRequest request,
                                                HttpServletResponse response)
            throws AuthenticationException {
        String username = obtainUsername(request);
        String password = obtainPassword(request);

        logger.debug("로그인 시도 - 사용자명: {}", username);
        logger.debug("요청 URI: {}", request.getRequestURI());
        logger.debug("요청 메서드: {}", request.getMethod());

        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(username, password, null);

        try {
            Authentication auth = authenticationManager.authenticate(authToken);
            logger.info("인증 성공 - 사용자명: {}", username);
            return auth;
        } catch (AuthenticationException e) {
            logger.error("인증 실패 - 사용자명: {}, 오류: {}", username, e.getMessage());
            throw e;
        }
    }

    @Override
    protected void successfulAuthentication(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain chain,
                                            Authentication authentication) {
        // CustomUserDetails 로 캐스팅하여 추가 정보 접근
        CustomUserDetails customUserDetails = (CustomUserDetails) authentication.getPrincipal();

        String username = customUserDetails.getUsername(); // userId
        Integer membershipId = customUserDetails.getMembershipId(); // membership_id 추가
        String name = customUserDetails.getRealName(); // name 추가

        Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
        Iterator<? extends GrantedAuthority> iterator = authorities.iterator();
        GrantedAuthority auth = iterator.next();
        String role = auth.getAuthority();

        logger.info("로그인 성공 - 사용자명: {}, ID: {}, 이름: {}, 권한: {}", username, membershipId, name, role);

        String token = jwtUtil.createToken(username, membershipId, name, role);

        logger.debug("JWT 토큰 생성 완료");

        response.addHeader("Authorization", "Bearer " + token);
    }

    @Override
    protected void unsuccessfulAuthentication(HttpServletRequest request,
                                              HttpServletResponse response,
                                              AuthenticationException failed)
            throws IOException {
        logger.error("로그인 실패 - URI: {}, 오류: {}", request.getRequestURI(), failed.getMessage());
        response.setStatus(401);
    }
}
