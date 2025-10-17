package com.example.app.repository;

import com.example.app.domain.Post;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post,Integer>
{
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    //findByUser() List
    //find(term, regionList, page, size): List

    // membershipId로 Post 찾기 - 삭제
    List<Post> findAllByUser(User user);
    /**
     * 모든 게시글을 조회할 때 User, Region, Chat 정보를 함께 Fetch Join하여 N+1 문제를 해결합니다.
     * /api/posts 와 같이 전체 목록을 조회하는 API에서 기본 findAll() 대신 사용해야 합니다.
     * @return 모든 Post 리스트 (User, Region, Chat 정보 포함)
     */
    @Query("SELECT DISTINCT p FROM Post p LEFT JOIN FETCH p.user LEFT JOIN FETCH p.chat LEFT JOIN FETCH p.regions")
    List<Post> findAllWithDetails();

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
