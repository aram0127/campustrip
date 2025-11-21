package com.example.app.service;

import com.example.app.domain.*;
import com.example.app.dto.*;
import com.example.app.repository.*;
import org.springframework.stereotype.Service;  // @Service 어노테이션
import org.springframework.beans.factory.annotation.Autowired;  // 의존성 주입용 (선택적)

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
public class PostService {
    private final PostRepository postRepository;
    private final UserRepository userRepository;
    private final RegionRepository regionRepository;
    private final PlannerRepository plannerRepository;
    private final PostAssetRepository postAssetRepository;

    @Autowired
    public PostService(PostRepository postRepository,
                       UserRepository userRepository, RegionRepository regionRepository, PlannerRepository plannerRepository, PostAssetRepository postAssetrepository) {
        this.postRepository = postRepository;
        this.userRepository = userRepository;
        this.regionRepository = regionRepository;
        this.plannerRepository = plannerRepository;
        this.postAssetRepository = postAssetrepository;
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

    public Post savePost(CreatePost createPost, ChatService chatService, S3Service s3Service) throws Exception {
        Post newPost = createPost.toEntity();
        Chat chat = chatService.saveChat(new CreateChat(newPost));
        newPost.setChat(chat);
        List<Integer> regions = createPost.getRegions();
        newPost.setRegions(new HashSet<>(regionRepository.findByRegionIdIn(regions)));
        newPost.setPlanner(plannerRepository.findById(1)
                .orElseThrow(() -> new NoSuchElementException("Planner not found with id: 1"))
        );
        newPost = postRepository.save(newPost);
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
        postRepository.deleteById(postId);
    }

    public PostDTO convertPostToDTO(Post post, ChatService chatService, RegionService regionService) {
        PostDTO postDTO = new PostDTO();
        postDTO.setPostId(post.getPostId());
        postDTO.setUser(post.getUser());
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

        return postDTO;
    }
}
