package com.example.app.service;

import com.example.app.domain.User;
import com.example.app.repository.UserRepository;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.Post;
import com.example.app.repository.PostRepository;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public Post getPostById(Integer postId) {
        return postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + postId));
    }

    public List<Post> getPostsByMembershipId(Integer membershipId) {
        User user = userRepository.findById(membershipId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + membershipId));
        return postRepository.findAllByUser(user);
    }

    public List<Post> getPostsByRegionIds(List<Integer> regionIds) {
        return postRepository.findAllByRegionIds(regionIds);
    }

    public void savePost(Post post) {
        postRepository.save(post);
    }

    public void deletePost(Integer postId) {
        postRepository.deleteById(postId);
    }

}
