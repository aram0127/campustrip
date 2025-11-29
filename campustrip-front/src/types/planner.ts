import {type User } from "./user";

// 리스트 목록 조회
export interface Planner {
  plannerId: number;
  userId: number;
  userName: string;
  title: string;
  startDate: string;
  endDate: string;
}

// 지도에 찍을 장소
export interface PlannerPlace {
  placeId?: number;
  placeName: string;
<<<<<<< HEAD
  latitude: number;   // 위도 
  longitude: number;  // 경도 
  order: number;      // 방문 순서 
  memo?: string;      // 메모
  category?: string;
=======
  latitude: number; // 위도
  longitude: number; // 경도
  order: number; // 방문 순서
  memo?: string; // 메모
>>>>>>> d56d7f4bb82081862dbf8805a21f095f464437fc
}

// 하루 일정
export interface PlannerSchedule {
  day: number;
  places: PlannerPlace[];
}

<<<<<<< HEAD
// 상세/수정 정보 
export interface PlannerDetail extends Planner {
  description?: string;
  memberCount?: number;
  schedules: PlannerSchedule[]; 
=======
// 상세 조회용
export interface PlannerDetail {
  plannerId: number;
  title: string;
  startDate: string;
  endDate: string;
  description?: string; // 플래너 설명
  memberCount?: number; // 여행 인원
  user: User; // 작성자
  schedules: PlannerSchedule[]; // 일정 데이터
>>>>>>> d56d7f4bb82081862dbf8805a21f095f464437fc
}
