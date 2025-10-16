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

    // membershipId로 Post 찾기

    List<Post> findAllByUser(User user);

    // regionId로 Post 찾기
    @Query("SELECT DISTINCT p FROM Post p JOIN FETCH p.regions r WHERE r.regionId IN :regionIds")
    List<Post> findAllByRegionIds(@Param("regionIds") List<Integer> regionIds);


    // 동적 쿼리 생성
//    @Query(value= "select m from Member m where m.memberId = :id and m.email = :email" )
//    Member findMemberByIdAndEmail(@Param("id") Long id, @Param("email") String email);
//    출처: https://sjh9708.tistory.com/167 [데굴데굴 개발자의 기록:티스토리]
}
