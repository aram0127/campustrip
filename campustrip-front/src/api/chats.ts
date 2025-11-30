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
