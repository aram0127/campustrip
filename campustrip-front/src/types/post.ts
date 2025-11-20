import { type Application } from "./application";

export interface Post {
  postId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  teamSize: number;
  memberSize: number;
  // User 정보
  user: {
    id: number;
    name: string;
    userId: string;
    userScore: number;
  };
  // Region 정보
  regions: {
    id: number;
    name: string;
  }[];

  // 게시글에 포함된 신청 목록
  applications: Application[];
}
