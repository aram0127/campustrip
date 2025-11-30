import { apiClient } from "./client";
import { type User } from "../types/user";

/* 특정 사용자의 프로필 정보를 가져옴 */
export const getUserProfile = async (id: number): Promise<User> => {
  const response = await apiClient.get<User>(`/api/users/${id}`);
  return response.data;
};

// 프로필 정보 수정 (텍스트 데이터)
export const updateUserProfile = async (
  id: number,
  data: Partial<User>
): Promise<User> => {
  const response = await apiClient.put<User>(`/api/users/${id}`, data);
  return response.data;
};

// 프로필 이미지 수정
export const updateUserProfileImage = async (
  id: number,
  file: File
): Promise<void> => {
  const formData = new FormData();
  formData.append("profileImage", file);

  await apiClient.put(`/api/users/${id}/profile-image`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
