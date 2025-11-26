import { apiClient } from "./client";
import { type Review } from "../types/review";

// 모든 리뷰 목록 조회
export const getReviews = async (): Promise<Review[]> => {
  const response = await apiClient.get<Review[]>("/api/reviews/");
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

  // DTO 필드 매핑
  formData.append("userId", data.userId.toString());
  formData.append("postId", data.postId.toString());
  formData.append("title", data.title);
  formData.append("body", data.body);

  // 이미지 파일 리스트 추가
  data.images.forEach((file) => {
    formData.append("images", file);
  });

  const response = await apiClient.post<Review>("/api/reviews/", formData);
  return response.data;
};
