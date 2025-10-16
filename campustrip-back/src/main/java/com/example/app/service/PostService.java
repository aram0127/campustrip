package com.example.app.service;

import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.Post;
import com.example.app.repository.PostRepository;

import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PostService {
    private final PostRepository postRepository;

    @Autowired
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(Integer post_id) {
        return postRepository.findById(post_id)
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + post_id));
    }

    public void savePost(Post post) {
        postRepository.save(post);
    }

    public void deletePost(Integer post_id) {
        postRepository.deleteById(post_id);
    }

}
