package com.example.app.service;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import com.example.app.dto.CreateApplicationRequest;
import com.example.app.dto.PushNotificationRequest;
import com.example.app.enumtype.PushNotificationType;
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

    private final FCMService fcmService;
    @Autowired
    public ApplicationService(ApplicationRepository applicationRepository,
                              UserRepository userRepository,
                              PostRepository postRepository, FCMService fcmService) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.applicationRepository = applicationRepository;
        this.fcmService = fcmService;
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
        User user = userRepository.findByUserId(application.getUser().getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

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

    public Application createApplication(CreateApplicationRequest request) {
        // 1. User 조회
        User user = userRepository.findByUserId(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + request.getUserId()));

        // 2. Post 조회
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(() -> new IllegalArgumentException("Post not found with id: " + request.getPostId()));

        // 3. Application 엔티티 생성 및 설정
        Application application = new Application();
        application.setUser(user);
        application.setPost(post);
        application.setApplicationStatus(null); // 초기 상태 (대기)
        // applicationDate는 엔티티 생성 시 자동 설정되거나 여기서 설정


        // FCM service 알림 전송 로직 추가 가능
            // 상대방 유저 찾기 - Post의 작성자
        PushNotificationRequest notificationRequest = new PushNotificationRequest(
                post.getUser().getId(),
                user.getId(),
                PushNotificationType.APLLICATION_REQUEST,
                post.getPostId(),
                "동행 신청이 완료되었습니다.",
                 user.getName() + "님 이 "+ post.getTitle() + "에 동행을 신청했습니다."
        );

        fcmService.sendNotificationToUser(notificationRequest);


        return applicationRepository.save(application);
    }

    public void updateApplicationStatus(Integer postId, User user, boolean status) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new RuntimeException("게시글을 찾을 수 없습니다."));

        Application application = applicationRepository.findByUserAndPost(user, post)
                .orElseThrow(() -> new RuntimeException("신청 내역을 찾을 수 없습니다."));

        application.setApplicationStatus(status);
        applicationRepository.save(application);
    }
}
