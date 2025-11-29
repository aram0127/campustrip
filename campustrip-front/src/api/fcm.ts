import { apiClient } from "./client";

// FCM 토큰 등록
export const registerFcmToken = async (membershipId: number, token: string) => {
  const response = await apiClient.post("/api/fcm/token", {
    membershipId,
    token,
  });
  return response.data;
};

// FCM 토큰 삭제
export const deleteFcmToken = async (token: string) => {
  const response = await apiClient.delete("/api/fcm/token", {
    params: { token },
  });
  return response.data;
};

// 사용자의 모든 FCM 토큰 삭제
export const deleteAllUserTokens = async (membershipId: number) => {
  const response = await apiClient.delete(`/api/fcm/token/user/${membershipId}`);
  return response.data;
};

// 테스트 알림 전송 - DTO 기반
export const sendTestNotification = async (
  receiverId: number,
  title: string,
  body: string,
  senderId?: number,
  type?: string
) => {
  const response = await apiClient.post("/api/fcm/test", {
    receiverId,
    senderId: senderId || null,
    type: type || "TEST",
    title,
    body,
  });
  return response.data;
};

