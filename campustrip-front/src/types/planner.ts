// ==========================================
// 백엔드 통신용 DTO (Backend DTO)
// ==========================================

/**
 * 백엔드 (Spring Boot)에서 요구하는 최소한의 상세 일정 정보 DTO.
 * PlannerService의 PlannerDetailDTO에 대응하며, 장소 ID와 순서만 포함합니다.
 */
export interface PlannerDetailDTO {
    // 백엔드의 @IdClass(PlannerDetailId.class)에 대응하는 필드
    plannerOrder: number;   // 일차 내 방문 순서 (order와 동일)
    day: number;            // 일차 (day와 동일)
    
    // 장소 식별자 (Google Place ID)
    googlePlaceId: string;  // 백엔드가 저장하는 유일한 장소 식별자
}

/**
 * 플래너 생성/수정 시 백엔드 (CreatePlanner DTO)로 전송하는 최종 요청 구조.
 */
export interface PlannerCreateRequest {
    title: string;
    startDate: string;
    endDate: string;
    // 백엔드에서 사용자 인증에 필요한 필드 (임시로 하드코딩했던 membershipId에 대응)
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
    // 백엔드 응답은 PlannerDetailDTO 배열을 포함합니다.
    schedules: PlannerDetailDTO[]; 
}

// ==========================================
// 클라이언트 렌더링/상태 관리용 타입 (Frontend State)
// ==========================================

// 리스트 목록 조회 (변동 없음)
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
    // DB Primary Key (옵셔널)
    plannerPlaceId?: number; 
    
    // 장소 식별자 (백엔드 DTO와 연동)
    googlePlaceId: string; // ✅ placeId -> googlePlaceId로 이름 변경 및 필수 필드로 지정
    
    placeName: string;
    latitude: number; // 위도
    longitude: number; // 경도
    order: number; // 방문 순서 (PlannerDetailDTO의 plannerOrder와 동일)
    memo?: string; // 메모
    category?: string; // 카테고리
}

// 하루 일정 (PlannerPlace[]를 가집니다. 변동 없음)
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
     schedules: PlannerSchedule[]; // PlannerSchedule[] 타입 유지
}
