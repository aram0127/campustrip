package com.example.app.service;

import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.User;
import com.example.app.repository.UserRepository;

import java.util.NoSuchElementException;

@Service
public class UserService {
    private final UserRepository userRepository;

    @Autowired
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByName(String name) {
        return userRepository.findByName(name);
    }

    public User getUserById(Long id) {
        return userRepository.findById(Long.valueOf(id))
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }
}
