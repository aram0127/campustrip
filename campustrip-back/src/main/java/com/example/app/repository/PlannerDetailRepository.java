package com.example.app.repository;

import com.example.app.domain.PlannerDetail;
import com.example.app.domain.PlannerDetailId;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PlannerDetailRepository extends JpaRepository<PlannerDetail, PlannerDetailId> {
    List<PlannerDetail> findByPlannerPlannerIdOrderByIdPlannerOrder(Integer plannerId);
}
