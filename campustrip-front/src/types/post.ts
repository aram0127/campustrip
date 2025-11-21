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
  // User 정보
  user: User;
  // Region 정보
  regions: {
    id: number;
    name: string;
  }[];

  // 게시글에 포함된 신청 목록
  applications: Application[];
}
