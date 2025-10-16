package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.service.PostService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    @Autowired
    public PostController(PostService postService) {
        this.postService = postService;
    }
    // GET: 전체 게시물 조회
    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    // GET: ID로 게시물 조회
    @GetMapping("/{postId}")
    public Post getPostById(@PathVariable Integer postId) {
        return postService.getPostById(postId);
    }

    // 사용자 ID로 게시물 조회 (작성한 게시글 조회)
    @GetMapping("/user/{membershipId}")
    public List<Post> getPostsByUserId(@PathVariable Integer membershipId) {
        return postService.getPostsByMembershipId(membershipId);
    }

    // 지역 ID들로 게시물 조회 (지역별 게시글 조회)
    @GetMapping("/regions")
    public List<Post> getPostsByRegionIds(@RequestParam List<Integer> regionIds) {
        return postService.getPostsByRegionIds(regionIds);
    }

    // POST: 새 게시물 생성
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        postService.savePost(post);
        return post;
    }

    // PUT: 게시물 정보 수정
    @PutMapping("/{postId}")
    public Post updatePost(@PathVariable Integer postId, @RequestBody Post post) {
        post.setPostId(postId);
        postService.savePost(post);
        return post;
    }

    // DELETE: 게시물 삭제
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable Integer postId) {
        postService.deletePost(postId);
    }
}
