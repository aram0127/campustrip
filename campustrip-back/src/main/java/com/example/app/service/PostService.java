package com.example.app.service;

import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.User;
import com.example.app.repository.UserRepository;

import java.util.NoSuchElementException;

@Service
public class PostService {
    private final PostRepository postRepository;

    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

//    public Post getPostById(Long id) {
//        return postRepository.findById(Long.valueOf(id))
//                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + id));
//    }

    public void savePost(Post post) {
        postRepository.save(post);
    }
}
