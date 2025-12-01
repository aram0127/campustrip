export interface PlannerDetailDTO {

  plannerOrder: number; // 일차 내 방문 순서 
  day: number; // 일차 

  // 장소 식별자 (Google Place ID)
  googlePlaceId: string; 
}

/**
 * 플래너 생성/수정 시 백엔드 (CreatePlanner DTO)로 전송하는 최종 요청 구조.
 */
export interface PlannerCreateRequest {
  title: string;
  startDate: string;
  endDate: string;
  // 백엔드에서 사용자 인증에 필요한 필드 
  membershipId: number;
  // 백엔드 DTO 배열 형식으로 변환하여 전송
  schedules: PlannerDetailDTO[];
}

/**
 * 플래너 상세 정보 조회 시 백엔드 (PlannerResponseDTO)에서 받는 응답 구조.
 * 장소의 상세 정보(이름, 좌표 등)는 포함하지 않고, ID 리스트만 받습니다.
 */
export interface PlannerDetailResponse extends Planner {
  description?: string;
  memberCount?: number;
  details: PlannerDetailDTO[];
}

// 리스트 목록 조회
export interface Planner {
  plannerId: number;
  userId: number;
  userName: string;
  title: string;
  startDate: string;
  endDate: string;
}

/**
 * 클라이언트 상태 관리 및 지도 렌더링을 위한 장소 상세 정보.
 * Google Places API를 통해 상세 정보가 채워지며, 백엔드 전송을 위해 googlePlaceId를 포함합니다.
 */
export interface PlannerPlace {
  // DB Primary Key 
  plannerPlaceId?: number;

  // 장소 식별자 
  googlePlaceId: string; //  placeId -> googlePlaceId로 이름 변경 및 필수 필드로 지정

  placeName: string;
  latitude: number; // 위도
  longitude: number; // 경도
  order: number; // 방문 순서
  memo?: string; // 메모
  category?: string; // 카테고리
}

// 하루 일정 
export interface PlannerSchedule {
  day: number;
  places: PlannerPlace[];
}

/**
 * 클라이언트 앱 내부에서 모든 상세 정보 (장소 이름, 좌표 등)를 포함하여
 * 상태를 관리하기 위한 타입. (PlannerEditPage에서 사용)
 */
export interface PlannerDetailClientState extends Planner {
  description?: string;
  memberCount?: number;
  schedules: PlannerSchedule[]; 
}
