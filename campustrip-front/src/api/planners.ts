import { apiClient } from "./client";
// 백엔드 DTO에 맞춘 타입
import { 
    type Planner, 
    type PlannerDetailResponse, // 상세 조회 응답 타입 (ID만 포함)
    type PlannerCreateRequest // 생성 및 수정 요청 바디 타입 (ID, Day, Order, membershipId 포함)
} from "../types/planner";

// 플래너 리스트
export const getMyPlanners = async (userId: number): Promise<Planner[]> => {
  const response = await apiClient.get<Planner[]>(
    `/api/planners/user/${userId}`
  );
  return response.data;
};

// 플래너 상세 조회 (응답 타입을 백엔드 DTO에 맞춤)
export const getPlannerDetail = async (
  plannerId: number
): Promise<PlannerDetailResponse> => {
  const response = await apiClient.get<PlannerDetailResponse>(
    `/api/planners/${plannerId}`
  );
  return response.data;
};


// 플래너 생성 (PlannerCreateRequest DTO를 받아 POST)
export const savePlanner = async (
  data: PlannerCreateRequest // 백엔드 DTO 형식 (title, schedules: PlannerDetailDTO[], membershipId)
): Promise<void> => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  // ID가 없는 경우만 생성
  await apiClient.post(`/api/planners`, data, config);
};

/**
 * 플래너 수정 (PlannerCreateRequest DTO를 받아 PUT)
 * @param plannerId 수정할 플래너 ID
 * @param data 수정할 내용 (title, schedules: PlannerDetailDTO[], membershipId)
 */
export const updatePlanner = async (
    plannerId: number,
    data: PlannerCreateRequest // 백엔드 DTO 형식
): Promise<void> => {
    const config = {
        headers: {
            "Content-Type": "application/json",
        },
    };
    // ID를 URL에 포함하여 PUT 요청
    await apiClient.put(`/api/planners/${plannerId}`, data, config);
};

// 플래너 삭제
export const deletePlanner = async (plannerId: number): Promise<void> => {
  await apiClient.delete(`/api/planners/${plannerId}`);
};