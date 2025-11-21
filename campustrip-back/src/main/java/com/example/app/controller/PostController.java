package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.domain.Region;
import com.example.app.dto.*;
import com.example.app.service.ChatService;
import com.example.app.service.PostService;
import com.example.app.service.RegionService;
import com.example.app.service.S3Service;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final ChatService chatService;
    private final RegionService regionService;
    private final S3Service s3Service;

    @Autowired
    public PostController(PostService postService, ChatService chatService, RegionService regionService, S3Service s3Service) {
        this.postService = postService;
        this.chatService = chatService;
        this.regionService = regionService;
        this.s3Service = s3Service;
    }

    // GET: 전체 게시물 조회 (DTO 리스트를 반환하도록 수정)
    @GetMapping
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postService.getAllPosts();

        // 엔티티 리스트를 DTO 리스트로 변환
        return posts.stream().map(post -> postService.convertPostToDTO(post, chatService, regionService)).collect(Collectors.toList());
    }

    // GET: ID로 게시물 조회 (기존 로직을 DTO 변환 메서드로 분리)
    @GetMapping("/{postId}")
    public PostDTO getPostById(@PathVariable Integer postId) {
        Post post = postService.getPostById(postId);
        return postService.convertPostToDTO(post, chatService, regionService);
    }

    // 사용자 ID로 게시물 조회 (DTO 리스트 반환)
    @GetMapping("/user/{membershipId}")
    public List<PostDTO> getPostsByUserId(@PathVariable Integer membershipId) {
        List<Post> posts = postService.getPostsByMembershipId(membershipId);
        return posts.stream().map(post -> postService.convertPostToDTO(post, chatService, regionService)).collect(Collectors.toList());
    }

    // 지역 ID들로 게시물 조회 (DTO 리스트 반환)
    @GetMapping("/regions")
    public List<PostDTO> getPostsByRegionIds(@RequestParam List<Integer> regionIds) {
        // 지역 ID가 비어있으면 전체 목록 반환
        if (regionIds == null || regionIds.isEmpty()) {
            return getAllPosts();
        }
        List<Post> posts = postService.getPostsByRegionIds(regionIds);
        return posts.stream().map(post -> postService.convertPostToDTO(post, chatService, regionService)).collect(Collectors.toList());
    }

    // POST: 새 게시물 생성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Post createPost(@ModelAttribute CreatePost createPost) throws Exception {
        Post post = postService.savePost(createPost, chatService, s3Service);
        return post;
    }

    // PUT: 게시물 정보 수정
    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Post updatePost(@PathVariable Integer postId, @ModelAttribute CreatePost updateData) throws Exception {
        updateData.setPostId(postId);
        return postService.updatePost(updateData, s3Service);
    }

    // DELETE: 게시물 삭제
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable Integer postId) {
        postService.deletePost(postId);
    }
}