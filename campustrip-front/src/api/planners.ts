import { apiClient } from "./client";
import { type Planner } from "../types/planner";

export const getMyPlanners = async (userId: number): Promise<Planner[]> => {
  const response = await apiClient.get<Planner[]>(
    `/api/planners/user/${userId}`
  );
  return response.data;
};
