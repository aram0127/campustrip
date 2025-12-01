import { apiClient } from "./client";
import { type PushNotification } from "../types/notification";

/* 사용자의 알림 목록 조회 */
export const getUserNotifications = async (
  userId: number
): Promise<PushNotification[]> => {
  const response = await apiClient.get<PushNotification[]>(
    `/api/notifications/user/${userId}`
  );
  return response.data;
};

/* 알림 삭제 */
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  await apiClient.delete(`/api/notifications/${notificationId}`);
};
