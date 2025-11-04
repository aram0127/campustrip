package com.example.app.controller;

import com.example.app.domain.Chat;
import com.example.app.domain.Post;
import com.example.app.domain.Region;
import com.example.app.dto.*;
import com.example.app.service.ChatService;
import com.example.app.service.PostService;
import com.example.app.service.RegionService;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final ChatService chatService;
    private final RegionService regionService;

    @Autowired
    public PostController(PostService postService, ChatService chatService, RegionService regionService) {
        this.postService = postService;
        this.chatService = chatService;
        this.regionService = regionService;
    }

    // GET: 전체 게시물 조회 (DTO 리스트를 반환하도록 수정)
    @GetMapping
    public List<PostDTO> getAllPosts() {
        List<Post> posts = postService.getAllPosts();

        // 엔티티 리스트를 DTO 리스트로 변환
        return posts.stream().map(this::convertPostToDTO).collect(Collectors.toList());
    }

    // GET: ID로 게시물 조회 (기존 로직을 DTO 변환 메서드로 분리)
    @GetMapping("/{postId}")
    public PostDTO getPostById(@PathVariable Integer postId) {
        Post post = postService.getPostById(postId);
        return convertPostToDTO(post);
    }

    // 사용자 ID로 게시물 조회 (DTO 리스트 반환)
    @GetMapping("/user/{membershipId}")
    public List<PostDTO> getPostsByUserId(@PathVariable Integer membershipId) {
        List<Post> posts = postService.getPostsByMembershipId(membershipId);
        return posts.stream().map(this::convertPostToDTO).collect(Collectors.toList());
    }

    // 지역 ID들로 게시물 조회 (DTO 리스트 반환)
    @GetMapping("/regions")
    public List<PostDTO> getPostsByRegionIds(@RequestParam List<Integer> regionIds) {
        // 지역 ID가 비어있으면 전체 목록 반환
        if (regionIds == null || regionIds.isEmpty()) {
            return getAllPosts();
        }
        List<Post> posts = postService.getPostsByRegionIds(regionIds);
        return posts.stream().map(this::convertPostToDTO).collect(Collectors.toList());
    }

    // POST: 새 게시물 생성
    @PostMapping
    public Post createPost(@RequestBody CreatePost createPost) {
        Post post = postService.savePost(createPost, chatService);
        return post;
    }

    // PUT: 게시물 정보 수정
    @PutMapping("/{postId}")
    public Post updatePost(@PathVariable Integer postId, @RequestBody CreatePost createPost) {
        createPost.setPostId(postId);
        Post post = postService.updatePost(createPost);
        return post;
    }

    // DELETE: 게시물 삭제
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable Integer postId) {
        postService.deletePost(postId);
    }

    // Post 엔티티를 PostDTO로 변환하는 공통 메서드
    private PostDTO convertPostToDTO(Post post) {
        PostDTO postDTO = new PostDTO();
        postDTO.setPostId(post.getPostId());
        postDTO.setUser(post.getUser());
        postDTO.setUserScore(post.getUser().getUserScore());
        postDTO.setTitle(post.getTitle());
        postDTO.setBody(post.getBody());
        postDTO.setCreatedAt(post.getCreatedAt());
        postDTO.setUpdatedAt(post.getUpdatedAt());
        postDTO.setTeamSize(post.getTeamSize());
        postDTO.setMemberSize(chatService.getNumberOfChatMembers(post.getChat()));
        postDTO.setChatId(post.getChat().getId());

        // 지역 이름 조합 로직
        List<RegionDTO> fullRegionNamesDTOs = post.getRegions().stream().map(region -> {
            Integer id = region.getRegionId();
            String name = region.getRegionName();

            if (id % 100 != 0 && id > 100) {
                Integer parentId = (id / 100) * 100;

                Region parentRegion = regionService.getRegionById(parentId);

                if (parentRegion != null) {
                    String fullName = parentRegion.getRegionName() + " " + name;
                    return new RegionDTO(fullName, id);
                }
            }
            return new RegionDTO(name, id);
        }).collect(Collectors.toList());

        postDTO.setRegions(fullRegionNamesDTOs);

        // Application 리스트 변환
        if (post.getApplications() != null) {
            List<ApplicationSimpleDTO> appDTOs = post.getApplications().stream()
                    .map(ApplicationSimpleDTO::new) // Application -> ApplicationSimpleDTO
                    .collect(Collectors.toList());
            postDTO.setApplications(appDTOs);
        } else {
            postDTO.setApplications(new ArrayList<>()); // 빈 리스트 보장
        }

        return postDTO;
    }
}