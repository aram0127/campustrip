import { apiClient } from "./client";
import { type Post } from "../types/post";
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

/* 특정 지역 ID 목록으로 게시글을 필터링하여 가져옴 */
export const getPostsByRegion = async (
  regionIds: number[]
): Promise<Post[]> => {
  // regionIds 배열을 쉼표로 구분된 문자열로 만듬
  const params = new URLSearchParams();
  regionIds.forEach((id) => params.append("regionIds", id.toString()));

  const response = await apiClient.get<Post[]>(
    `/api/posts/regions?${params.toString()}`
  );
  return response.data;
};

// createPost 함수가 받는 데이터 타입
export interface CreatePostData {
  formData: {
    regions: { id: number; name: string }[];
    title: string;
    body: string;
    startDate: string | null;
    endDate: string | null;
    teamSize: number;
    plannerId: number | null;
  };
  user: UserInfo;
}

/* 새 게시글을 생성 */
export const createPost = async ({
  formData,
  user,
}: CreatePostData): Promise<Post> => {
  const postDataPayload = {
    user: { id: user.id },
    title: formData.title,
    body: formData.body,
    teamSize: formData.teamSize,
    regions: formData.regions.map((region) => region.id),
    plannerId: formData.plannerId,
    startAt: formData.startDate,
    endAt: formData.endDate,
  };

  // POST /api/posts 로 데이터 전송
  try {
    const postResponse = await apiClient.post<Post>(
      "/api/posts",
      postDataPayload
    );
    return postResponse.data;
  } catch (err) {
    console.error("게시글 생성 실패:", err);
    throw new Error("게시글 생성에 실패했습니다.");
  }
};

export type UpdatePostData = CreatePostData;

/* 특정 ID의 게시글을 수정 */
export const updatePost = async (
  postId: string,
  { formData, user }: UpdatePostData
): Promise<Post> => {
  const postDataPayload = {
    user: { id: user.id },
    title: formData.title,
    body: formData.body,
    teamSize: formData.teamSize,
    regions: formData.regions.map((region) => region.id),
    plannerId: formData.plannerId,
    startAt: formData.startDate,
    endAt: formData.endDate,
  };

  // PUT /api/posts/{postId} 로 데이터 전송
  try {
    const postResponse = await apiClient.put<Post>(
      `/api/posts/${postId}`,
      postDataPayload
    );
    return postResponse.data;
  } catch (err) {
    console.error("게시글 수정 실패:", err);
    throw new Error("게시글 수정에 실패했습니다.");
  }
};

/* 특정 ID의 게시글을 삭제 */
export const deletePost = async (postId: string): Promise<void> => {
  await apiClient.delete(`/api/posts/${postId}`);
};
