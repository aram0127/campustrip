package com.example.app.service;

import com.example.app.domain.*;
import com.example.app.dto.*;
import com.example.app.repository.*;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;
import org.springframework.data.domain.SliceImpl;
import java.util.LinkedHashMap;
import java.util.Comparator;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PlannerRepository plannerRepository;
    private final PostAssetRepository postAssetRepository;
    private final S3Service s3Service;
    private final ApplicationRepository applicationRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository, RegionRepository regionRepository, PlannerRepository plannerRepository, PostAssetRepository postAssetrepository, S3Service s3Service,
                       ApplicationRepository applicationRepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.regionRepository = regionRepository;
        this.plannerRepository = plannerRepository;
        this.postAssetRepository = postAssetrepository;
        this.s3Service = s3Service;
        this.applicationRepository = applicationRepository;
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

    // 추가: 사용자 작성 + state=1 신청 게시글을 중복 없이 합쳐 Slice로 반환
    public Slice<Post> getPostsByMembershipIdSlice(Integer membershipId, Pageable pageable) {
        User user = userRepository.findById(membershipId)
                .orElseThrow(() -> new NoSuchElementException("User not found with id: " + membershipId));

        // 작성한 게시글
        List<Post> authored = postRepository.findAllByUserWithDetails(user);
        // 신청한 게시글 중 state=1
        List<Post> appliedAccepted = applicationRepository.findAllByUser(user).stream()
                .filter(app -> Boolean.TRUE.equals(app.getApplicationStatus()))
                .map(Application::getPost)
                .collect(Collectors.toList());

        // 중복 제거: postId 기준으로 유지하면서 최신 정렬
        LinkedHashMap<Integer, Post> dedupMap = new LinkedHashMap<>();
        // 합치기
        for (Post p : authored) {
            dedupMap.put(p.getPostId(), p);
        }
        for (Post p : appliedAccepted) {
            dedupMap.putIfAbsent(p.getPostId(), p);
        }
        List<Post> merged = new ArrayList<>(dedupMap.values());
        // 정렬: createdAt DESC 기본
        merged.sort(Comparator.comparing(Post::getCreatedAt, java.util.Comparator.nullsLast(java.util.Comparator.naturalOrder())).reversed());

        // 페이징 구성: SliceImpl
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int fromIndex = Math.min(page * size, merged.size());
        int toIndex = Math.min(fromIndex + size, merged.size());
        List<Post> content = merged.subList(fromIndex, toIndex);
        boolean hasNext = toIndex < merged.size();
        return new SliceImpl<>(content, pageable, hasNext);
    }

    public List<Post> getPostsByRegionIds(List<Integer> regionIds) {
        // n+1 문제 해결 위해 수정
        return postRepository.findPostsByRegionIds(regionIds);
        //return postRepository.findAllByRegionIds(regionIds);
    }

    public Post savePost(CreatePost createPost, ChatService chatService, ChatMessageService chatMessageService, S3Service s3Service) throws Exception {
        Post newPost = createPost.toEntity();
        Chat chat = chatService.saveChat(new CreateChat(newPost));
        chatMessageService.sendJoinMessage(chat, newPost.getUser().getId());
        newPost.setChat(chat);
        List<Integer> regions = createPost.getRegions();
        newPost.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));
        Planner planner = plannerRepository.findById(createPost.getPlannerId())
                .orElseThrow(() -> new NoSuchElementException("Planner not found with id: " + createPost.getPlannerId()));
        newPost.setPlanner(planner);
        newPost = postRepository.save(newPost);

        // 이미지 없을 때 처리
        if (createPost.getImages() == null || createPost.getImages().isEmpty()) {
            return newPost;
        }
        // 이미지 업로드 처리
        try{
            for(var image : createPost.getImages()){
                String imageUrl = s3Service.uploadFile(image);
                postAssetRepository.save(new PostAsset(newPost, imageUrl));
            }
        } catch(Exception e){
            throw new Exception("Image upload failed: " + e.getMessage());
        }
        return newPost;
    }

    public Post updatePost(CreatePost updateData, S3Service s3Service) throws Exception {
        Post existingPost = postRepository.findById(updateData.getPostId())
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + updateData.getPostId()));
        // 기존 이미지 삭제 처리 추가
        List<PostAsset> existingAssets = (List<PostAsset>) postAssetRepository.findAllByPost(existingPost);
        for (var asset : existingAssets) {
            s3Service.deleteFile(asset.getStorageUrl()); // S3에서 파일 삭제
            postAssetRepository.delete(asset); // DB에서 레코드 삭제
        }
        existingPost.setTitle(updateData.getTitle());
        existingPost.setBody(updateData.getBody());
        existingPost.setUpdatedAt(java.time.LocalDateTime.now());
        existingPost.setTeamSize(updateData.getTeamSize());
        existingPost.setStartAt(updateData.getStartAt());
        existingPost.setEndAt(updateData.getEndAt());

        List<Integer> regions = updateData.getRegions();
        existingPost.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));

        Post savedPost = postRepository.save(existingPost);

        // 이미지 업로드 처리
        // 다시 확인해보자
        if (updateData.getImages() != null && !updateData.getImages().isEmpty()) {
            try {
                for (var image : updateData.getImages()) {
                    String imageUrl = s3Service.uploadFile(image);
                    PostAsset asset = new PostAsset();
                    asset.setPost(savedPost);
                    asset.setStorageUrl(imageUrl);
                    asset.setFileSize(Math.toIntExact(image.getSize()));
                    postAssetRepository.save(asset);
                }
            } catch (Exception e) {
                throw new Exception("Image upload failed: " + e.getMessage());
            }
        }

        return savedPost;
    }

    public void deletePost(Integer postId) {
        // 관련된 PostAsset도 함께 삭제
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NoSuchElementException("Post not found with id: " + postId));
        List<PostAsset> assets = (List<PostAsset>) postAssetRepository.findAllByPost(post);
        for (var asset : assets) {
            s3Service.deleteFile(asset.getStorageUrl()); // S3에서 파일 삭제
            postAssetRepository.delete(asset);
        }
        // 관련된 PostRegion, Application 등도 cascade 옵션에 의해 함께 삭제될 것임
        postRepository.deleteById(postId);
    }

    public PostDTO convertPostToDTO(Post post, ChatService chatService, RegionService regionService) {
        PostDTO postDTO = new PostDTO();
        postDTO.setPostId(post.getPostId());
        postDTO.setUser(new UserResponse(post.getUser()));
        postDTO.setUserScore(post.getUser().getUserScore());
        postDTO.setTitle(post.getTitle());
        postDTO.setBody(post.getBody());
        postDTO.setCreatedAt(post.getCreatedAt());
        postDTO.setUpdatedAt(post.getUpdatedAt());
        postDTO.setStartAt(post.getStartAt());
        postDTO.setEndAt(post.getEndAt());
        postDTO.setTeamSize(post.getTeamSize());
        postDTO.setMemberSize(chatService.getNumberOfChatMembers(post.getChat()));
        postDTO.setChatId(post.getChat().getId());

        // 지역 이름 조합 로직
        List<RegionDTO> fullRegionNamesDTOs = post.getRegions().stream()
                // Region ID 기준으로 오름차순 정렬
                .sorted((r1, r2) -> r1.getRegionId().compareTo(r2.getRegionId()))
                .map(region -> {
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

        // PostAsset 리스트 변환
        List<String> assetUrls = postAssetRepository.findAllByPost(post).stream()
                .map(PostAsset::getStorageUrl)
                .collect(Collectors.toList());
        postDTO.setPostAssets(assetUrls);
        return postDTO;
    }

    /**
     * 전체 게시글 조회
     * keyword가 null이거나 빈 문자열이면 전체 조회, 있으면 검색 조회
     */
    public Slice<Post> getAllPostsSlice(String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return postRepository.findAllByKeyword(keyword, pageable);
        }
        return postRepository.findAllBy(pageable);
    }

    /**
     * 지역 필터링 게시글 조회
     * keyword가 null이거나 빈 문자열이면 지역 필터만 적용, 있으면 지역+검색 조회
     */
    public Slice<Post> getPostsByRegionIdsSlice(List<Integer> regionIds, String keyword, Pageable pageable) {
        if (keyword != null && !keyword.trim().isEmpty()) {
            return postRepository.findPostsByRegionIdsAndKeyword(regionIds, keyword, pageable);
        }
        return postRepository.findPostsByRegionIdsSlice(regionIds, pageable);
    }
}
