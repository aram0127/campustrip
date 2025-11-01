package com.example.app.service;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.repository.ApplicationRepository;
import com.example.app.repository.UserRepository;
import com.example.app.repository.PostRepository;
import com.example.app.domain.Application;
import org.springframework.transaction.annotation.Transactional;

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

        // DB에서 영속 상태의 엔티티 조회
        User user = userRepository.findByUserId(application.getUser().getUserId());
        if(user == null){
            throw new IllegalArgumentException("User not found");
        }
        Post post = postRepository.findById(application.getPost().getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found"));

        // 영속 상태의 엔티티로 교체
        application.setUser(user);
        application.setPost(post);

        applicationRepository.save(application);
    }

    @Transactional
    public void deleteApplication(Integer userId, Integer postId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("사용자를 찾을 수 없습니다."));

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        applicationRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new RuntimeException("신청 내역을 찾을 수 없습니다."));

        applicationRepository.deleteByUserAndPost(user, post);
    }
}
