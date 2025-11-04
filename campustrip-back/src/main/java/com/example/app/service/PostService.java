package com.example.app.service;

import com.example.app.domain.Chat;
import com.example.app.domain.User;
import com.example.app.dto.CreateChat;
import com.example.app.dto.CreatePost;
import com.example.app.repository.*;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)
import com.example.app.domain.Post;

import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PlannerRepository plannerRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository, RegionRepository regionRepository, PlannerRepository plannerRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.regionRepository = regionRepository;
        this.plannerRepository = plannerRepository;
    }

    public List<Post> getAllPosts() {
        // n+1 문제 해결 위해 수정
        return postRepository.findAllWithDetails();
        //return postRepository.findAll();
    }

    public Post getPostById(Integer postId) {
        // n+1 문제 해결 위해 수정
        return postRepository.findByIdWithDetails(postId)
        //return postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + postId));
    }

    public List<Post> getPostsByMembershipId(Integer membershipId) {
        User user = userRepository.findById(membershipId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + membershipId));
        // n+1 문제 해결 위해 수정
         return postRepository.findAllByUserWithDetails(user);
        //return postRepository.findAllByUser(user);
    }

    public List<Post> getPostsByRegionIds(List<Integer> regionIds) {
        // n+1 문제 해결 위해 수정
        return postRepository.findPostsByRegionIds(regionIds);
        //return postRepository.findAllByRegionIds(regionIds);
    }

    public Post savePost(CreatePost createPost, ChatService chatService) {
        Post newPost = createPost.toEntity();
        Chat chat = chatService.saveChat(new CreateChat(newPost));
        newPost.setChat(chat);
        List<Integer> regions = createPost.getRegions();
        newPost.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));
        newPost.setPlanner(plannerRepository.findById(1)
                .orElseThrow(() -> new NoSuchElementException("Planner not found with id: 1"))
        );
        return postRepository.save(newPost);
    }

    public Post updatePost(CreatePost updateData) {
        Post existingPost = postRepository.findById(updateData.getPostId())
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + updateData.getPostId()));

        existingPost.setTitle(updateData.getTitle());
        existingPost.setBody(updateData.getBody());
        existingPost.setUpdatedAt(java.time.LocalDateTime.now());
        existingPost.setTeamSize(updateData.getTeamSize());

        List<Integer> regions = updateData.getRegions();
        existingPost.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));

        return postRepository.save(existingPost);
    }

    public void deletePost(Integer postId) {
        postRepository.deleteById(postId);
    }

    public void assignRegionsToPost(Post post, List<Integer> regions) {
        post.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));
    }
}
