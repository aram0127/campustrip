package com.example.app.service;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.repository.ApplicationRepository;
import com.example.app.repository.UserRepository;
import com.example.app.repository.PostRepository;
import com.example.app.domain.Application;

import java.util.List;

@Service
public class ApplicationService {
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final PostRepository postRepository;
    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              PostRepository postRepository) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.applicationRepository = applicationRepository;
    }

    public List<Application> getApplicationsByUserId(Integer userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return applicationRepository.findAllByUser(user);
    }

    public List<Application> getApplicationsByPostId(Integer postId) {
        Post post = postRepository.findById(postId).orElseThrow();
        return applicationRepository.findAllByPost(post);
    }

    public void saveApplication(Application application) {
        // null 체크 추가
        if (application.getPost().getPostId() == null) {
            throw new IllegalArgumentException("Post ID cannot be null");
        }
        if (application.getUser().getId() == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }

        // DB에서 영속 상태의 엔티티 조회
        User user = userRepository.findById(application.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        Post post = postRepository.findById(application.getPost().getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        // 영속 상태의 엔티티로 교체
        application.setUser(user);
        application.setPost(post);

        applicationRepository.save(application);
    }

    public void deleteApplication(Integer userId, Integer postId) {
        User user = userRepository.findById(userId).orElseThrow();
        Post post = postRepository.findById(postId).orElseThrow();
        applicationRepository.deleteByUserAndPost(user, post);
    }
}
