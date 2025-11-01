package com.example.app.service;

import com.example.app.domain.Planner;
import com.example.app.dto.PlannerDetailDTO;
import com.example.app.dto.PlannerResponseDTO;
import com.example.app.repository.PlannerDetailRepository;
import com.example.app.repository.PlannerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlannerService{
    private final PlannerRepository plannerRepository;
    private final PlannerDetailRepository plannerDetailRepository;

    public PlannerService(PlannerRepository plannerRepository,
                          PlannerDetailRepository plannerDetailRepository) {
        this.plannerRepository = plannerRepository;
        this.plannerDetailRepository = plannerDetailRepository;
    }

    public List<Planner> findAllByUserId(Integer memberId) {
        return plannerRepository.findAllByUserId(memberId);
    }

    public Optional<PlannerResponseDTO> getPlannerWithDetails(Integer plannerId) {
        return plannerRepository.findById(plannerId).map(planner -> {
            var details = plannerDetailRepository
                    .findByPlannerPlannerIdOrderByIdPlannerOrder(plannerId)
                    .stream()
                    .map(d -> new PlannerDetailDTO(
                            d.getId().getPlannerOrder(),
                            d.getDay(),
                            d.getGooglePlaceId()
                    ))
                    .collect(Collectors.toList());

            return new PlannerResponseDTO(
                    planner.getPlannerId(),
                    planner.getStartDate(),
                    planner.getEndDate(),
                    details
            );
        });
    }
}
