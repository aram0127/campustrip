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
    @GetMapping("/{post_id}")
    public Post getPostById(@PathVariable Integer post_id) {
        return postService.getPostById(post_id);
    }

    // POST: 새 게시물 생성
    @PostMapping
    public Post createPost(@RequestBody Post post) {
        postService.savePost(post);
        return post;
    }

    // PUT: 게시물 정보 수정
    @PutMapping("/{post_id}")
    public Post updatePost(@PathVariable Integer post_id, @RequestBody Post post) {
        post.setPostId(post_id);
        postService.savePost(post);
        return post;
    }

    // DELETE: 게시물 삭제
    @DeleteMapping("/{post_id}")
    public void deletePost(@PathVariable Integer post_id) {
        postService.deletePost(post_id);
    }
}
