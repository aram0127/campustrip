import { type Application } from "./application";
import { type User } from "./user";

export interface Post {
  postId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  teamSize: number;
  memberSize: number;
  startAt: string | null;
  endAt: string | null;
  userScore: number;
  chatId: number;
  plannerId?: number | null;
  user: User;
  regions: {
    id: number;
    name: string;
  }[];
  applications: Application[];
  postAssets: string[];
}

// 참여자 목록 및 평가 여부 확인용 타입
export interface PostMember {
  postId: number;
  userId: number;
  userName: string;
  profilePhotoUrl: string;
  rated: boolean;
}
