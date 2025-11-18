package com.example.app.repository;

import com.example.app.domain.Universities;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UniversitiesRepository extends JpaRepository<Universities, Integer> {
    // 추가적인 쿼리 메서드가 필요하면 여기에 정의
    Universities findByDomain(String domain);
    Universities findByName(String name);
}
