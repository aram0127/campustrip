import { apiClient } from "./client";
import { type Chat, type ChatMessage, type ChatMember } from "../types/chat";

/* 내가 참여중인 모든 채팅 목록을 가져옴 */
export const getMyChats = async (userId: number): Promise<Chat[]> => {
  const response = await apiClient.get<Chat[]>(`/api/chats/chat/${userId}`, {
    params: {
      id: userId,
    },
  });
  return response.data;
};

/* 특정 채팅방의 이전 메시지 내역을 불러옴 */
export const getChatHistory = async (
  roomId: string
): Promise<ChatMessage[]> => {
  const response = await apiClient.get<ChatMessage[]>(
    `/api/chats/chat/${roomId}/messages`
  );
  return response.data;
};

/* 특정 채팅방의 참여자 목록 조회 */
export const getChatMembers = async (chatId: string): Promise<ChatMember[]> => {
  const response = await apiClient.get<ChatMember[]>(
    `/api/chats/chat/${chatId}/members`
  );
  return response.data;
};

/* 이미지 메시지 전송 */
export const sendImageMessage = async (
  roomId: number,
  userId: number,
  userName: string,
  file: File
): Promise<void> => {
  const formData = new FormData();
  formData.append("roomId", roomId.toString());
  formData.append("membershipId", userId.toString());
  formData.append("userName", userName);
  formData.append("messageType", "IMAGE");
  formData.append("message", "");
  formData.append("image", file);

  await apiClient.post("/api/chats/chat/message/image", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
