import { apiClient } from "./client";
import { type User } from "../types/user";

/* 특정 사용자의 프로필 정보를 가져옴
 * @param userId - 조회할 사용자의 ID (membership_id)
 */
export const getUserProfile = async (userId: string): Promise<User> => {
  // apiClient는 이미 baseURL과 인증 헤더를 가지고 있습니다.
  const response = await apiClient.get<User>(`/api/users/${userId}`);
  return response.data;
};
