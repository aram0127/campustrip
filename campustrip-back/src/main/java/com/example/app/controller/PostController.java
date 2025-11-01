package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.dto.PostDTO;
import com.example.app.dto.CreatePost;
import com.example.app.service.ChatService;
import com.example.app.service.PostService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final ChatService chatService;

    @Autowired
    public PostController(PostService postService, ChatService chatService) {
        this.postService = postService;
        this.chatService = chatService;
    }

    // GET: 전체 게시물 조회
    @GetMapping
    public List<Post> getAllPosts() {
        return postService.getAllPosts();
    }

    // GET: ID로 게시물 조회
    @GetMapping("/{postId}")
    public PostDTO getPostById(@PathVariable Integer postId) {
        Post post = postService.getPostById(postId);
        PostDTO postDTO = new PostDTO();
        postDTO.setUserName(post.getUser().getName());
        postDTO.setUserScore(post.getUser().getUserScore());
        postDTO.setTitle(post.getTitle());
        postDTO.setBody(post.getBody());
        postDTO.setCreatedAt(post.getCreatedAt());
        postDTO.setUpdatedAt(post.getUpdatedAt());
        postDTO.setTeamSize(post.getTeamSize());
        postDTO.setMemberNumber(chatService.getNumberOfChatMembers(post.getChat()));
        postDTO.setRegions(post.getRegions().stream().map(region -> region.getRegionName()).toList());
        postDTO.setChatId(post.getChat().getId());
        return postDTO;
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
    public Post createPost(@RequestBody CreatePost createPost) {
        Post post = new Post();
        post.setUser(createPost.getUser());
        post.setTitle(createPost.getTitle());
        post.setBody(createPost.getBody());
        post.setCreatedAt(createPost.getCreatedAt());
        post.setTeamSize(createPost.getTeamSize());
        List<Integer> regions = createPost.getRegions();
        postService.assignRegionsToPost(post, regions);
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

    // 추후 추가할 것
    // 채팅방과 연결된 게시물 조회
}
