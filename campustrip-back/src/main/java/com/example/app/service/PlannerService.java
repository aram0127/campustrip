package com.example.app.service;

import com.example.app.domain.Planner;
import com.example.app.domain.User;
import com.example.app.domain.PlannerDetail;
import com.example.app.domain.PlannerDetailId;
import com.example.app.dto.CreatePlanner;
import com.example.app.dto.PlannerDetailDTO;
import com.example.app.dto.PlannerResponseDTO;
import com.example.app.repository.PlannerDetailRepository;
import com.example.app.repository.PlannerRepository;
import com.example.app.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class PlannerService {
    private final PlannerRepository plannerRepository;
    private final PlannerDetailRepository plannerDetailRepository;
    private final UserRepository userRepository;

    public PlannerService(PlannerRepository plannerRepository,
                          PlannerDetailRepository plannerDetailRepository, UserRepository userRepository) {
        this.plannerRepository = plannerRepository;
        this.plannerDetailRepository = plannerDetailRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Planner savePlannerWithDetails(CreatePlanner createPlanner) {
        Planner planner = Planner.builder()
                .user(userRepository.findById(createPlanner.getMembershipId()).orElseThrow())
                .title(createPlanner.getTitle())
                .startDate(createPlanner.getStartDate())
                .endDate(createPlanner.getEndDate())
                .build();
        System.out.println("Saving planner: " + planner.getTitle());
        System.out.println("Saving planner: " + planner.getStartDate() + " - " + planner.getEndDate());
        plannerRepository.save(planner);

        if (createPlanner.getSchedules() != null) {
            for (PlannerDetailDTO detailDTO : createPlanner.getSchedules()) {
                PlannerDetail detail = new PlannerDetail(
                        new PlannerDetailId(detailDTO.getPlannerOrder(), planner.getPlannerId()),
                        planner,
                        detailDTO.getDay(),
                        detailDTO.getGooglePlaceId()
                );
                plannerDetailRepository.save(detail);
            }
        }
        return planner;
    }

    @Transactional
    public Planner updatePlannerWithDetails(Integer plannerId, CreatePlanner createPlanner) {
        Planner planner = plannerRepository.findById(plannerId)
                .orElseThrow(() -> new IllegalArgumentException("Planner not found with id: " + plannerId));

        planner.setTitle(createPlanner.getTitle());
        planner.setStartDate(createPlanner.getStartDate());
        planner.setEndDate(createPlanner.getEndDate());

        plannerDetailRepository.deleteByPlannerPlannerId(plannerId);

        if (createPlanner.getSchedules() != null) {
            for (PlannerDetailDTO detailDTO : createPlanner.getSchedules()) {
                PlannerDetail detail = new PlannerDetail(
                        new PlannerDetailId(detailDTO.getPlannerOrder(), planner.getPlannerId()),
                        planner,
                        detailDTO.getDay(),
                        detailDTO.getGooglePlaceId()
                );
                plannerDetailRepository.save(detail);
            }
        }
        return plannerRepository.save(planner);
    }

    public List<Planner> findAllByUserId(Integer memberId) {
        return plannerRepository.findAllByUserId(memberId);
    }

    public List<Planner> findAllByUserUserId(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with userId: " + userId));
        return plannerRepository.findAllByUserId(user.getId());
    }

    public void savePlanner(Planner planner) {
        plannerRepository.save(planner);
    }

    public void deletePlanner(Integer plannerId) {
        plannerRepository.deleteById(plannerId);
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
                    .toList();

            return new PlannerResponseDTO(
                    planner.getPlannerId(),
                    planner.getUser().getId(),
                    planner.getUser().getName(),
                    planner.getTitle(),
                    planner.getStartDate(),
                    planner.getEndDate(),
                    details
            );
        });
    }
}