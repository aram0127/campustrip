package com.example.app.service;

import com.example.app.dto.*;
import com.example.app.repository.UserRateRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.User;
import com.example.app.domain.UserRate;
import com.example.app.repository.UserRepository;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class UserService implements UserDetailsService {
    private final UserRepository userRepository;
    private final UserRateRepository userRateRepository;
    private final S3Service s3Service;

    @Autowired
    public UserService(UserRepository userRepository, UserRateRepository userRateRepository, S3Service s3Service) {
        this.userRepository = userRepository;
        this.userRateRepository = userRateRepository;
        this.s3Service = s3Service;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserByName(String name) {
        return userRepository.findByName(name);
    }

    public User getUserByUserId(String userId) {
        return userRepository.findByUserId(userId).orElseThrow(() -> new NoSuchElementException("User not found with userId: " + userId));
    }

    public User getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
        if (user == null) {
            throw new NoSuchElementException("User not found with id: " + id);
        }
        return user;
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public UserResponse updateUserFromRequest(Integer id, EditUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + id));
        if (user == null) {
            throw new NoSuchElementException("User not found with id: " + id);
        }
        user.setName(request.getName());
        user.setGender(request.getGender());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setEmail(request.getEmail());
        user.setSchoolEmail(request.getSchoolEmail());
        user.setDescription(request.getDescription());
        userRepository.save(user);
        return new UserResponse(user);
    }

    public void deleteUser(Integer id) {
        userRepository.deleteById(id);
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByName(username);
        if (user == null) {
            throw new UsernameNotFoundException("User not found: " + username);
        }
        return new CustomUserDetails(user);
    }

    // 사용자 평가 남기기
    public void rateUser(String userId, CreateUserRate request) {
        // 구현 내용 생략
        UserRate userRate = new UserRate();
        User rater = userRepository.findByUserId(userId).orElseThrow();
        User target = userRepository.findById(request.getTargetId()).orElseThrow();
        userRate.getId().setRaterId(rater.getId());
        userRate.getId().setTargetId(target.getId());
        userRate.setRater(rater);
        userRate.setTarget(target);
        Integer rate = request.getRate() >= 1 ? 1 : -1;
        userRate.setRate(rate);
        userRate.setComment(request.getComment());
        userRateRepository.save(userRate);
        Integer targetRate = userRateRepository.sumRateByTargetId(request.getTargetId());
        target.setScore(targetRate);
        userRepository.save(target);
    }

    // 내 사용자 평가 가져오기
    public List<UserRateDTO> getUserRatesByRaterId(Integer raterId) {
        return userRateRepository.findByRaterId(raterId).stream().map(rate -> {
            UserRateDTO dto = new UserRateDTO();
            dto.setRaterId(rate.getRater().getId());
            dto.setRaterName(rate.getRater().getName());
            dto.setTargetId(rate.getTarget().getId());
            dto.setTargetName(rate.getTarget().getName());
            dto.setRate(rate.getRate());
            dto.setComment(rate.getComment());
            return dto;
        }).toList();
    }

    // 내가 받은 평가 가져오기
    public List<UserRateDTO> getUserRatesByTargetId(Integer targetId) {
        return userRateRepository.findByTargetId(targetId).stream().map(rate -> {
            UserRateDTO dto = new UserRateDTO();
            dto.setRaterId(rate.getRater().getId());
            dto.setRaterName(rate.getRater().getName());
            dto.setTargetId(rate.getRater().getId());
            dto.setTargetName(rate.getRater().getName());
            dto.setRate(rate.getRate());
            dto.setComment(rate.getComment());
            return dto;
        }).toList();
    }

    public void updateUserProfilePhoto(User user, MultipartFile file) {
        if (user.getProfilePhotoUrl() != null) {
            s3Service.deleteFile(user.getProfilePhotoUrl());
        }
        try {
            String imageUrl = s3Service.uploadFile(file);
            user.setProfilePhotoUrl(imageUrl);
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload profile image: " + e.getMessage());
        }
    }

    public boolean isUserIdAvailable(String userId) {
        return !userRepository.existsByUserId(userId);
    }
}
