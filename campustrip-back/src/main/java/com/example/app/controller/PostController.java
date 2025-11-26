package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.domain.Region;
import com.example.app.dto.*;
import com.example.app.service.ChatService;
import com.example.app.service.PostService;
import com.example.app.service.RegionService;
import com.example.app.service.S3Service;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
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
//      page 대신 slice로 바꾸기 - pagable 쓰는 코드 참고용임
//    // GET: 전체 게시물 조회 (페이징 처리)
//    //Parameter로 페이지번호(pageNo), 정렬 기준(criteria)을 받는다.
//    //default 값은 페이지 번호 0, 정렬 기준 createdAt(작성일자)이다.
//    // /paged?pageNo=1&size=10&sort=createdAt
//    @GetMapping("/paged")
//    public Page<PostDTO> getAllPostsPaged(
//            @RequestParam(required = false, defaultValue = "0", value="page") int pageNo,
//            @RequestParam(required = false, defaultValue = "5", value = "size") int size,
//            @RequestParam(required = false, defaultValue = "createdAt", value="sort") String sort) {
//
//        Pageable pageable = PageRequest.of(pageNo, size, Sort.by(Sort.Direction.DESC, sort));
//        Page<Post> postPage = postService.getAllPostsPaged(pageable);
//        // 엔티티 페이지를 DTO 페이지로 변환
//        return postPage.map(post -> postService.convertPostToDTO(post, chatService, regionService));
//    }
    @GetMapping("/infinite")
    public Slice<PostDTO> getAllPostsInfinite(
            @PageableDefault(size = 3, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Slice<Post> postSlice = postService.getAllPostsSlice(pageable);
        System.out.println("요청된 페이지 크기(Size): " + pageable.getPageSize());
        System.out.println("요청된 페이지 번호(Page): " + pageable.getPageNumber());
        // 엔티티 슬라이스를 DTO 슬라이스로 변환
        return postSlice.map(post -> postService.convertPostToDTO(post, chatService, regionService));
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