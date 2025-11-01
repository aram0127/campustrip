// import { apiClient } from "./client";
import { type Planner } from "../types/planner";

// TODO: 백엔드에 'GET /api/planners/my' 엔드포인트 구현 시
// 아래 주석을 해제하고, dummyPlanners 반환 로직을 제거해야함
/*
export const getMyPlanners = async (): Promise<Planner[]> => {
  const response = await apiClient.get<Planner[]>("/api/planners/my");
  return response.data;
};
*/

// (임시) 백엔드 API가 구현되기 전까지 사용할 더미 데이터
const dummyPlanners: Planner[] = [
  {
    plannerId: 1,
    userId: 1,
    title: "부산 2박 3일 여행",
    startDate: "2025-10-10",
    endDate: "2025-10-12",
    members: "홍길동, 김영희",
  },
  {
    plannerId: 2,
    userId: 1,
    title: "경주 당일치기",
    startDate: "2025-11-01",
    endDate: "2025-11-01",
    members: "나, 김철수, 박민지",
  },
];

// (임시) 1초 뒤에 더미 데이터를 반환하는 임시 API 함수
export const getMyPlanners = async (): Promise<Planner[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(dummyPlanners);
    }, 1000);
  });
};
