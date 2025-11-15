import { apiClient } from "./client";
import { type User } from "../types/user";

/* 특정 사용자의 프로필 정보를 가져옴 */
export const getUserProfile = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/api/users/${id}`);
  return response.data;
};
