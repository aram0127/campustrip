import { apiClient } from "./client";
import { type Post } from "../types/post";
import { type User } from "../types/user";
import { type Region } from "../types/region";
import { type Chat } from "../types/chat";
import { type UserInfo } from "../context/AuthContext";

/* 모든 게시글 목록을 가져옴 */
export const getPosts = async (): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>("/api/posts");
  return response.data;
};

/* 특정 ID의 게시글을 가져옴 */
export const getPostById = async (postId: string): Promise<Post> => {
  const response = await apiClient.get<Post>(`/api/posts/${postId}`);
  return response.data;
};

// createPost 함수가 받는 데이터 타입 (Context의 formData + user)
export interface CreatePostData {
  formData: {
    region: string | null;
    title: string;
    body: string;
    startDate: string | null;
    endDate: string | null;
    teamSize: number;
    plannerId: number | null;
  };
  user: UserInfo;
}

/**
 * 새 게시글을 생성
 * 1. 새 채팅방 생성 (POST /api/chats)
 * 2. 지역 정보 조회 (GET /api/regions/findByName)
 * 3. 새 게시글 생성 (POST /api/posts)
 */
export const createPost = async ({
  formData,
  user,
}: CreatePostData): Promise<Post> => {
  // 새 채팅방 생성
  // ChatService.java의 CreateChat DTO는 title과 userId를 받음
  let createdChat: Chat;
  try {
    const chatResponse = await apiClient.post<Chat>("/api/chats", {
      title: formData.title,
      userId: user.id, // User의 membership_id
    });
    createdChat = chatResponse.data;
  } catch (err) {
    console.error("채팅방 생성 실패:", err);
    throw new Error("채팅방 생성에 실패했습니다.");
  }

  // 지역 객체 조회
  // RegionRepository.java의 findByRegionName
  let regionObject: Region | null = null;
  try {
    if (formData.region) {
      // TODO: 백엔드에 '/api/regions/findByName?name=...' 엔드포인트 구현 필요
      const regionResponse = await apiClient.get<Region>(
        `/api/regions/findByName?name=${formData.region}`
      );
      regionObject = regionResponse.data;
    }
  } catch (err) {
    console.error("지역 정보 조회 실패:", err);
    // 지역 조회를 실패해도 게시글 생성은 계속 진행 (regions: [])
  }

  // 최종 Post 객체 조립
  const postData = {
    title: formData.title,
    body: formData.body,
    teamSize: formData.teamSize,
    user: { id: user.id }, // 백엔드가 User 객체 전체를 받을 경우 User 엔티티 연결
    chat: { id: createdChat.id }, // 1단계에서 생성한 채팅 객체
    regions: regionObject ? [{ regionId: regionObject.regionId }] : [], // 2단계에서 조회한 지역 객체
    // TODO: 백엔드 Post.java의 planner 필드 주석 해제 후, 아래 필드 추가
    // planner: { plannerId: formData.plannerId },
  };

  // 새 게시글 생성
  try {
    const postResponse = await apiClient.post<Post>("/api/posts", postData);
    return postResponse.data;
  } catch (err) {
    console.error("게시글 생성 실패:", err);
    throw new Error("게시글 생성에 실패했습니다.");
  }
};
