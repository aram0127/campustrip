import { apiClient } from "./client";
import { type Planner } from "../types/planner";

// 플래너 리스트 
export const getMyPlanners = async (userId: number): Promise<Planner[]> => {
  const response = await apiClient.get<Planner[]>(
    `/api/planners/user/${userId}`
  );
  return response.data;
};

// 플래너 상세 조회
export const getPlannerDetail = async (plannerId: number): Promise<PlannerDetail> => {
  const response = await apiClient.get<PlannerDetail>(
    `/api/planners/${plannerId}`
  );
  return response.data;
};

// 플래너 생성 및 수정
export const savePlanner = async (data: Partial<PlannerDetail>): Promise<void> => {
  if (data.plannerId) {
    // ID가 있으면 수정 
    await apiClient.put(`/api/planners/${data.plannerId}`, data);
  } else {
    // ID가 없으면 생성 
    await apiClient.post(`/api/planners`, data);
  }
};

// 플래너 삭제
export const deletePlanner = async (plannerId: number): Promise<void> => {
  await apiClient.delete(`/api/planners/${plannerId}`);
};