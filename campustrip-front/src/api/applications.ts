import { apiClient } from "./client";
import { type Application } from "../types/application";
import { type Applicant } from "../types/applicant";

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

/* 특정 게시글의 신청자 목록을 조회 */
export const getApplicants = async (postId: string): Promise<Applicant[]> => {
  const response = await apiClient.get<Applicant[]>(
    `/api/applications/post/${postId}`
  );
  return response.data;
};

// 수락/거절 시 API에 보낼 데이터 타입
// (백엔드의 AcceptApplication.java DTO)
interface ManageApplicationData {
  postId: number;
  userId: number; // 신청자의 membership_id
}

/* 동행 신청 수락 */
export const acceptApplication = async (
  data: ManageApplicationData
): Promise<Application> => {
  const response = await apiClient.put<Application>(
    "/api/applications/accept",
    data
  );
  return response.data;
};

/* 동행 신청 거절 */
export const rejectApplication = async (
  data: ManageApplicationData
): Promise<Application> => {
  const response = await apiClient.put<Application>(
    "/api/applications/reject",
    data
  );
  return response.data;
};
