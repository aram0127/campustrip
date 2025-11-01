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
                    .collect(Collectors.toList());

            return new PlannerResponseDTO(
                    planner.getPlannerId(),
                    planner.getStartDate(),
                    planner.getEndDate(),
                    details
            );
        });
    }
    /*
    요약:
        getPlannerWithDetails(Integer plannerId)는 주어진 플래너 ID로 Planner를 조회하고, 해당 플래너의 상세 장소 목록을 별도 조회해 DTO로 합쳐 Optional<PlannerResponseDTO>로 반환한다.
    작동 흐름:
        plannerRepository.findById(plannerId)로 Planner를 Optional로 조회. (플래너가 없으면 빈 Optional 반환)
        플래너가 존재하면 람다 내부에서 plannerDetailRepository.findByPlannerPlannerIdOrderByIdPlannerOrder(plannerId)로 정렬된 PlannerDetail 리스트를 조회.
        조회된 PlannerDetail 리스트를 스트림으로 변환해 각각을 PlannerDetailDTO로 매핑 (plannerOrder, day, googlePlaceId 사용).
        매핑된 상세 DTO 리스트와 planner의 기본 필드(plannerId, startDate, endDate)를 이용해 PlannerResponseDTO 생성.
        생성된 DTO를 래핑한 Optional<PlannerResponseDTO>를 반환(플래너 미존재 시엔 빈 Optional).
    주의/장점:
        별도 리포지토리 호출로 상세를 따로 조회하므로 필요한 필드만 가져오고 Lazy 로딩 문제를 제어할 수 있음.
        반환 타입이 Optional이라 컨트롤러에서 404 처리(없음) 또는 200 처리(존재) 쉽게 구현 가능.
     */
}
