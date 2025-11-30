package com.example.app.controller;

import com.example.app.domain.Post;
import com.example.app.dto.*;
import com.example.app.service.*;
import org.springframework.data.domain.*;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;
    private final ChatService chatService;
    private final ChatMessageService chatMessageService;
    private final RegionService regionService;
    private final S3Service s3Service;

    @Autowired
    public PostController(PostService postService, ChatService chatService, ChatMessageService chatMessageService, RegionService regionService, S3Service s3Service) {
        this.postService = postService;
        this.chatService = chatService;
        this.chatMessageService = chatMessageService;
        this.regionService = regionService;
        this.s3Service = s3Service;
    }

    @GetMapping
    public Slice<PostDTO> getAllPostsInfinite(
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 3, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable){
        System.out.println("=== getAllPostsInfinite 호출 ===");
        System.out.println("요청된 페이지 크기(Size): " + pageable.getPageSize());
        System.out.println("요청된 페이지 번호(Page): " + pageable.getPageNumber());
        System.out.println("정렬 정보: " + pageable.getSort());

        Slice<Post> postSlice = postService.getAllPostsSlice(keyword, pageable);

        System.out.println("조회된 게시글 수: " + postSlice.getNumberOfElements());
        System.out.println("첫 페이지 여부: " + postSlice.isFirst());
        System.out.println("마지막 페이지 여부: " + postSlice.isLast());
        System.out.println("현재 페이지 번호: " + postSlice.getNumber());

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

    // 지역 ID들로 게시물 조회 (Slice로 반환)
    @GetMapping("/regions")
    public Slice<PostDTO> getPostsByRegionIds(
            @RequestParam(required = false) List<Integer> regionIds,
            @RequestParam(required = false) String keyword,
            @PageableDefault(size = 3, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Slice<Post> postSlice;
        if (regionIds == null || regionIds.isEmpty()) {
            // 지역 선택 안 함 -> 전체 검색으로 위임
            postSlice = postService.getAllPostsSlice(keyword, pageable);
        } else {
            // 지역 선택 함 -> 지역 + 검색
            postSlice = postService.getPostsByRegionIdsSlice(regionIds, keyword, pageable);
        }

        return postSlice.map(post -> postService.convertPostToDTO(post, chatService, regionService));
    }

    // 사용자 id를 통해 작성한 게시글 또는 참여한 게시글 (Post + Application)조회
    @GetMapping("/membership/{membershipId}")
    public Slice<PostDTO> getPostsByMembershipId(
            @PathVariable Integer membershipId,
            @PageableDefault(size = 3, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        Slice<Post> slice = postService.getPostsByMembershipIdSlice(membershipId, pageable);
        return slice.map(post -> postService.convertPostToDTO(post, chatService, regionService));
    }

    // POST: 새 게시물 생성
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostDTO createPost(@ModelAttribute CreatePost createPost) throws Exception {
        Post post = postService.savePost(createPost, chatService, chatMessageService, s3Service);
        return postService.convertPostToDTO(post, chatService, regionService);
    }

    // PUT: 게시물 정보 수정
    @PutMapping(value = "/{postId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public PostDTO updatePost(@PathVariable Integer postId, @ModelAttribute CreatePost updateData) throws Exception {
        updateData.setPostId(postId);
        Post updatedPost = postService.updatePost(updateData, s3Service);
        return postService.convertPostToDTO(updatedPost, chatService, regionService);
    }

    // DELETE: 게시물 삭제
    @DeleteMapping("/{postId}")
    public void deletePost(@PathVariable Integer postId) {
        postService.deletePost(postId);
    }
}