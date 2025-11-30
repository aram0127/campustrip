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
  category?: string;
}

// 하루 일정
export interface PlannerSchedule {
  day: number;
  places: PlannerPlace[];
}

// 상세/수정 정보
export interface PlannerDetail extends Planner {
  description?: string;
  memberCount?: number;
  schedules: PlannerSchedule[];
}
