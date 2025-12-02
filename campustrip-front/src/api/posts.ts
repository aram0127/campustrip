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
    images: File[];
  };
  user: UserInfo;
}

/* 새 게시글을 생성 */
export const createPost = async ({
  formData,
  user,
}: CreatePostData): Promise<Post> => {
  const payload = new FormData();

  // 일반 필드 추가
  payload.append("user.id", user.id.toString());
  payload.append("title", formData.title);
  payload.append("body", formData.body);
  payload.append("teamSize", formData.teamSize.toString());

  if (formData.startDate) payload.append("startAt", formData.startDate);
  if (formData.endDate) payload.append("endAt", formData.endDate);
  if (formData.plannerId)
    payload.append("plannerId", formData.plannerId.toString());

  // 리스트 데이터 추가 (지역 ID)
  formData.regions.forEach((region) => {
    payload.append("regions", region.id.toString());
  });

  // 이미지 파일 추가
  formData.images.forEach((file) => {
    payload.append("images", file);
  });

  // POST /api/posts 로 FormData 전송
  try {
    const postResponse = await apiClient.post<Post>("/api/posts", payload);
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
  const payload = new FormData();

  payload.append("user.id", user.id.toString());
  payload.append("title", formData.title);
  payload.append("body", formData.body);
  payload.append("teamSize", formData.teamSize.toString());

  if (formData.startDate) payload.append("startAt", formData.startDate);
  if (formData.endDate) payload.append("endAt", formData.endDate);
  if (formData.plannerId)
    payload.append("plannerId", formData.plannerId.toString());

  formData.regions.forEach((region) => {
    payload.append("regions", region.id.toString());
  });

  formData.images.forEach((file) => {
    payload.append("images", file);
  });

  // PUT /api/posts/{postId} 로 데이터 전송
  try {
    const postResponse = await apiClient.put<Post>(
      `/api/posts/${postId}`,
      payload
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

/* 특정 사용자가 작성한 게시글 목록 조회 */
export const getPostsByUserId = async (userId: number): Promise<Post[]> => {
  const response = await apiClient.get<Post[]>(`/api/posts/user/${userId}`);
  return response.data;
};

export interface PostSlice<T> {
  content: T[];
  first: boolean;
  last: boolean;
  number: number; // page number
  size: number; // requested size
  numberOfElements: number;
  empty: boolean;
  sort?: { sorted: boolean; unsorted: boolean; empty: boolean };
  pageable?: { pageNumber: number; pageSize: number; offset: number };
}

export interface InfinitePostsParams {
  page?: number;
  size?: number;
  sort?: string;
  regionIds?: number[] | null;
  universityId?: number | null;
  keyword?: string;
}

export const getInfinitePosts = async ({
  page = 0,
  size = 3,
  sort,
  regionIds,
  universityId,
  keyword,
}: InfinitePostsParams = {}): Promise<PostSlice<Post>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (sort) params.append("sort", sort);

  if (keyword) {
    params.append("keyword", keyword);
  }

  // universityId 필터가 있으면 우선 적용 (지역 필터도 함께 적용 가능)
  if (universityId) {
    params.append("universityId", universityId.toString());

    // 대학교 필터와 함께 지역 필터도 적용
    if (regionIds && regionIds.length > 0) {
      regionIds.forEach((id) => {
        params.append("regionIds", id.toString());
      });
    }

    const response = await apiClient.get<PostSlice<Post>>(
      `/api/posts/university?${params.toString()}`
    );
    return response.data;
  }

  // universityId가 없을 때는 지역 필터만 적용
  if (regionIds && regionIds.length > 0) {
    regionIds.forEach((id) => {
      params.append("regionIds", id.toString());
    });
  }

  const url =
    regionIds && regionIds.length > 0
      ? `/api/posts/regions?${params.toString()}`
      : `/api/posts?${params.toString()}`;

  const response = await apiClient.get<PostSlice<Post>>(url);
  return response.data;
};

/* 내가 작성하거나 참여한 모든 여행 게시글 조회 */
export const getMyTripHistory = async (
  userId: number,
  page = 0,
  size = 100
): Promise<PostSlice<Post>> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());

  const response = await apiClient.get<PostSlice<Post>>(
    `/api/posts/membership/${userId}?${params.toString()}`
  );
  return response.data;
};
