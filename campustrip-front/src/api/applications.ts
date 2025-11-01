import { apiClient } from "./client";
import { type Application } from "../types/application";

// '동행 신청' 시 POST로 보낼 데이터의 타입 정의
interface ApplicationData {
  post: { postId: number };
  user: { userId: string };
}

/* 동행 신청 */
export const createApplication = async (
  applicationData: ApplicationData
): Promise<Application> => {
  const response = await apiClient.post<Application>(
    "/api/applications",
    applicationData
  );
  return response.data;
};

interface CancelApplicationData {
  userId: number; // User의 membership_id
  postId: number; // Post의 postId
}

/* 동행 신청 취소 */
export const cancelApplication = async ({
  userId,
  postId,
}: CancelApplicationData): Promise<void> => {
  await apiClient.delete(`/api/applications/${userId}/${postId}`);
};
