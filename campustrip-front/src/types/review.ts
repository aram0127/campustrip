import { type User } from "./user";

export interface Review {
  reviewId: number;
  user: User;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  postId: number;
  imageUrls: string[] | null;
  likeCount: number;
  likedByCurrentUser: boolean;
}

export interface Comment {
  id: number;
  userId: number;
  userName: string;
  reviewId: number;
  body: string;
  createdAt: string;
}
