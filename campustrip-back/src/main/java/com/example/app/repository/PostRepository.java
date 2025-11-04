package com.example.app.repository;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PostRepository extends JpaRepository<Post,Integer>
{
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    //findByUser() List
    //find(term, regionList, page, size): List
    /**
     * 모든 게시글을 조회할 때 User, Region, Chat 정보를 함께 Fetch Join하여 N+1 문제를 해결합니다.
     * /api/posts 와 같이 전체 목록을 조회하는 API에서 기본 findAll() 대신 사용해야 합니다.
     * @return 모든 Post 리스트 (User, Region, Chat 정보 포함)
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.chat LEFT JOIN FETCH p.regions")
    List<Post> findAllWithDetails();

    /**
     * 게시글 ID로 단일 게시글을 조회합니다.
     * JPQL의 JOIN FETCH를 사용하여 User, Chat, Region 정보를 함께 조회하여 N+1 문제를 방지합니다.
     *
     * @param postId 조회할 게시글의 ID
     * @return Post 객체를 담은 Optional
     */
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.chat LEFT JOIN FETCH p.regions LEFT JOIN FETCH p.applications app LEFT JOIN FETCH app.user WHERE p.postId = :postId")
    Optional<Post> findByIdWithDetails(@Param("postId") Integer postId);

    // membershipId로 Post 찾기 - 삭제
    List<Post> findAllByUser(User user);
    /**
     * 특정 사용자가 작성한 모든 게시글을 조회합니다.
     * JPQL의 JOIN FETCH를 사용하여 User, Chat, Region 정보를 함께 조회하여 N+1 문제를 방지합니다.
     *
     * @param user 조회할 User 객체
     * @return 해당 사용자의 Post 리스트
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.chat LEFT JOIN FETCH p.regions WHERE p.user = :user")
    List<Post> findAllByUserWithDetails(@Param("user") User user);

    // regionId로 Post 찾기 - 삭제
    @Query("SELECT DISTINCT p FROM Post p JOIN FETCH p.regions r WHERE r.regionId IN :regionIds")
    List<Post> findAllByRegionIds(@Param("regionIds") List<Integer> regionIds);
    /**
     * 주어진 regionId 리스트에 포함된 지역(Region)과 하나라도 연관된 모든 게시글(Post)을 조회합니다.
     * JPQL의 JOIN FETCH를 사용하여 N+1 문제를 방지하고, DISTINCT를 통해 중복된 Post가 반환되는 것을 막습니다.
     *
     * @param regionIds 조회할 지역 ID의 리스트
     * @return 조건에 맞는 Post 리스트 (User, Region, Chat 정보 포함)
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.chat JOIN FETCH p.regions r WHERE r.regionId IN :regionIds")
    List<Post> findPostsByRegionIds(@Param("regionIds") List<Integer> regionIds);

    // 동적 쿼리 생성
//    @Query(value= "select m from Member m where m.memberId = :id and m.email = :email" )
//    Member findMemberByIdAndEmail(@Param("id") Long id, @Param("email") String email);
//    출처: https://sjh9708.tistory.com/167 [데굴데굴 개발자의 기록:티스토리]
}
