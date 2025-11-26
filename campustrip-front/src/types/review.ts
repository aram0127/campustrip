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
}
