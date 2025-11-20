import { apiClient } from "./client";

// RegionDTO.java 와 일치하는 타입
export interface RegionDTO {
  id: number;
  name: string;
}

// RegionList.java 와 일치하는 타입
export interface RegionList {
  province: string;
  regions: RegionDTO[];
}

/* 모든 지역 목록을 계층 구조로 가져옴
 * (예: [ { province: "서울특별시", regions: [...] }, ... ])
 */
export const getAllRegions = async (): Promise<RegionList[]> => {
  const response = await apiClient.get<RegionList[]>("/api/regions/all");
  return response.data;
};
