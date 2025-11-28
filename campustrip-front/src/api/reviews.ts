import { apiClient } from "./client";
import { type Review, type Comment } from "../types/review";

export interface ReviewSlice {
  content: Review[];
  last: boolean;
  number: number; // 현재 페이지 번호
  size: number;
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

export interface InfiniteReviewsParams {
  page?: number;
  size?: number;
  sort?: string; // 'createdAt,desc' or 'likes'
  keyword?: string; // 검색어
}

// 리뷰 목록 조회
export const getInfiniteReviews = async ({
  page = 0,
  size = 10,
  sort = "createdAt,desc",
  keyword,
}: InfiniteReviewsParams = {}): Promise<ReviewSlice> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("size", size.toString());
  if (sort) params.append("sort", sort);
  if (keyword) params.append("keyword", keyword);

  const response = await apiClient.get<ReviewSlice>(
    `/api/reviews/?${params.toString()}`
  );
  return response.data;
};

// 특정 리뷰 상세 조회
export const getReviewById = async (reviewId: number): Promise<Review> => {
  const response = await apiClient.get<Review>(`/api/reviews/${reviewId}`);
  return response.data;
};

export interface CreateReviewData {
  userId: number;
  postId: number;
  title: string;
  body: string;
  images: File[];
}

// 리뷰 생성
export const createReview = async (data: CreateReviewData): Promise<Review> => {
  const formData = new FormData();

  formData.append("userId", data.userId.toString());
  formData.append("postId", data.postId.toString());
  formData.append("title", data.title);
  formData.append("body", data.body);

  data.images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await apiClient.post<Review>("/api/reviews/", formData);
  return response.data;
};

/* 좋아요 요청 */
export const likeReview = async (reviewId: number): Promise<void> => {
  await apiClient.post(`/api/reviews/${reviewId}/like`);
};

/* 좋아요 취소 요청 */
export const unlikeReview = async (reviewId: number): Promise<void> => {
  await apiClient.post(`/api/reviews/${reviewId}/unlike`);
};

/* 댓글 목록 조회 */
export const getComments = async (reviewId: number): Promise<Comment[]> => {
  const response = await apiClient.get<Comment[]>(
    `/api/reviews/${reviewId}/comment`
  );
  return response.data;
};

/* 댓글 작성 */
export const addComment = async (
  reviewId: number,
  comment: string
): Promise<void> => {
  const formData = new FormData();
  formData.append("comment", comment);
  await apiClient.post(`/api/reviews/${reviewId}/comment`, formData);
};

/* 댓글 삭제 */
export const deleteReviewComment = async (
  reviewId: number,
  commentId: number
): Promise<void> => {
  await apiClient.delete(`/api/reviews/${reviewId}/comment/${commentId}`);
};

/* 후기 삭제 */
export const deleteReview = async (reviewId: number): Promise<void> => {
  await apiClient.delete(`/api/reviews/${reviewId}`);
};
