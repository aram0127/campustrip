package com.example.app.repository;

import com.example.app.domain.Planner;
import com.example.app.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlannerRepository extends JpaRepository<Planner,Integer> {
    // JPA Repository 기본 메세드
    // save, findById, findAll, deleteById, existsById, count

    List<Planner> findAllByUserId(Integer userId);
}
