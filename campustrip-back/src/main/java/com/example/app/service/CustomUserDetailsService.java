package com.example.app.service;

import com.example.app.domain.User;
import com.example.app.dto.CustomUserDetails;
import com.example.app.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service("customUserDetailsService")
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // userId로 사용자 찾기
        User user = userRepository.findByUserId(username);

        if (user == null) {
            throw new UsernameNotFoundException("User not found with userId: " + username);
        }

        return new CustomUserDetails(user);
    }
}