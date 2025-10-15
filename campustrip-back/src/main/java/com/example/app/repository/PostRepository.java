package com.example.app.repository;

import com.example.app.domain.Post;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PostRepository extends JpaRepository<Post,Integer>
{
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    //findByUser() DTO List
    //find(term, regionList, page, size): DTO List

    // 동적 쿼리 생성
//    @Query(value= "select m from Member m where m.memberId = :id and m.email = :email" )
//    Member findMemberByIdAndEmail(@Param("id") Long id, @Param("email") String email);
//    출처: https://sjh9708.tistory.com/167 [데굴데굴 개발자의 기록:티스토리]
}
