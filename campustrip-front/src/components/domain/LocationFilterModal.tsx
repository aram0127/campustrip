import React, { useState, useMemo } from "react";
import styled from "styled-components";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { useQuery } from "@tanstack/react-query";
import {
  getAllRegions,
  type RegionList,
  type RegionDTO,
} from "../../api/regions";

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  margin-bottom: ${({ theme }) => theme.spacings.medium};
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: ${({ theme }) => theme.spacings.small}
    ${({ theme }) => theme.spacings.medium}; /* 12px 16px */
  border: none;
  background-color: transparent;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.grey};
  border-bottom: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : "transparent"};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.body};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.medium};
  height: 300px;
`;

const RegionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
  border-right: 1px solid ${({ theme }) => theme.colors.borderColor};

  &:last-child {
    border-right: none;
  }
`;

const RegionItem = styled.li<{ isSelected: boolean }>`
  padding: ${({ theme }) => theme.spacings.small}; /* 12px */
  border-radius: ${({ theme }) => theme.borderRadius.small};
  cursor: pointer;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : "transparent"};
  color: ${({ theme, isSelected }) =>
    isSelected ? "white" : theme.colors.text};

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      !isSelected &&
      (theme.colors.background === "#FFFFFF" ? "#f1f1f1" : "#333")};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.xsmall};
  margin-top: ${({ theme }) => theme.spacings.medium}; /* 16px */
`;

const Message = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacings.xlarge}
    ${({ theme }) => theme.spacings.medium}; /* 32px 16px */
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (locationIds: number[] | null) => void;
}

// 1차 지역 목록(RegionList)에서 모든 하위 ID를 추출하는 헬퍼 함수
const getAllIdsFromRegionList = (regionList: RegionList[]): number[] => {
  const ids: number[] = [];
  regionList.forEach((province) => {
    province.regions.forEach((region) => {
      ids.push(region.id);
    });
  });
  // ID가 0인 경우(DB 데이터 오류) 필터링
  return ids.filter((id) => id > 0);
};

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
}) => {
  const [activeTab, setActiveTab] = useState<"domestic" | "overseas">(
    "domestic"
  );
  // 1차 지역 이름 (예: "경기도")
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  // 최종 선택 (ID와 이름)
  const [finalSelection, setFinalSelection] = useState<{
    id: number | null;
    name: string | null;
  }>({ id: null, name: "전체" });

  // API 호출 로직
  const {
    data: regionData,
    isLoading,
    error,
  } = useQuery<RegionList[], Error>({
    queryKey: ["regions"],
    queryFn: getAllRegions,
    staleTime: 1000 * 60 * 60, // 1시간 동안 캐시 유지
  });

  // API 응답 데이터를 국내/해외로 분리
  const { domesticRegions, overseasRegions } = useMemo(() => {
    const domestic: RegionList[] = [];
    const overseas: RegionList[] = [];

    if (!regionData) return { domesticRegions: [], overseasRegions: [] };

    regionData.forEach((province) => {
      // regions 배열의 '첫 번째 자식' ID를 가져옴 (예: 101, 2001).
      const firstChildId = province.regions[0]?.id ?? 0;

      // 100단위 ID(100, 2000)가 아닌, '첫 번째 자식' ID로 분류
      if (firstChildId > 0 && firstChildId < 2000) {
        domestic.push(province);
      } else if (firstChildId >= 2000) {
        overseas.push(province);
      }
    });
    return { domesticRegions: domestic, overseasRegions: overseas };
  }, [regionData]);

  // 현재 선택된 1차 지역의 하위 지역 목록
  const subRegions = useMemo(() => {
    if (!selectedMain) return [];
    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const found = dataList.find((p) => p.province === selectedMain);
    // 100 단위 ID(1차 지역)를 제외한 하위 지역만 반환
    return found ? found.regions.filter((r) => r.id % 100 !== 0) : [];
  }, [selectedMain, domesticRegions, overseasRegions, activeTab]);

  // 핸들러 함수들
  const handleApply = () => {
    // "전체"가 선택된 경우
    if (finalSelection.id === null) {
      if (activeTab === "domestic") {
        const allDomesticIds = getAllIdsFromRegionList(domesticRegions);
        // 국내 모든 ID (100, 101, ..., 1702) 배열 전달
        onApply(allDomesticIds.length > 0 ? allDomesticIds : null);
      } else if (activeTab === "overseas") {
        const allOverseasIds = getAllIdsFromRegionList(overseasRegions);
        // 해외 모든 ID (2000, 2001, ...) 배열 전달
        onApply(allOverseasIds.length > 0 ? allOverseasIds : null);
      } else {
        onApply(null); // (필터 해제와 동일)
      }
      onClose();
      return;
    }

    // 2차 지역 (e.g., "해운대구")
    if (finalSelection.id && finalSelection.id % 100 !== 0) {
      onApply([finalSelection.id]);
      onClose();
      return;
    }

    // 1차 지역 (e.g., "부산광역시")
    if (finalSelection.id && finalSelection.id % 100 === 0) {
      const dataList =
        activeTab === "domestic" ? domesticRegions : overseasRegions;
      const province = dataList.find((p) => p.province === finalSelection.name);

      if (province) {
        // 해당 1차 지역의 모든 하위 ID (101, 102...) 가져오기
        const allIdsInProvince = province.regions.map((r) => r.id);

        if (!allIdsInProvince.includes(finalSelection.id)) {
          allIdsInProvince.push(finalSelection.id);
        }

        onApply(allIdsInProvince);
      } else {
        onApply([finalSelection.id]);
      }
      onClose();
      return;
    }
  };

  const handleClear = () => {
    onApply(null); // '전체'와 동일하게 null 전달
    onClose();
  };

  const handleTabClick = (tab: "domestic" | "overseas") => {
    setActiveTab(tab);
    setSelectedMain(null);
    setFinalSelection({ id: null, name: "전체" });
  };

  // 1차 지역 (시/도 또는 대륙) 선택
  const handleSelectMain = (province: RegionList) => {
    setSelectedMain(province.province);

    // 1차 지역의 ID(예: 100)는 2차 지역(예: 101)에서 추론
    const firstChildId = province.regions[0]?.id ?? 0;
    if (firstChildId > 0) {
      const parentId = Math.floor(firstChildId / 100) * 100;
      // 1차 지역 이름(province.province)과 추론한 ID(parentId)를 저장
      setFinalSelection({ id: parentId, name: province.province });
    } else {
      // 2차 지역이 없는 경우 (예: 세종시) - DB 구조에 따라 조정 필요
      setFinalSelection({ id: null, name: province.province });
    }
  };

  // 2차 지역 (시/군/구 또는 국가) 선택
  const handleSelectSub = (subRegion: RegionDTO) => {
    setFinalSelection({ id: subRegion.id, name: subRegion.name });
  };

  // '전체' (1차 목록)
  const handleSelectAllProvinces = () => {
    setSelectedMain(null);
    setFinalSelection({ id: null, name: "전체" });
  };

  // '전체' (2차 목록)
  const handleSelectProvinceAsFinal = () => {
    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const province = dataList.find((p) => p.province === selectedMain);
    if (province) {
      handleSelectMain(province);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>어디로 떠나시나요?</Title>
      <TabContainer>
        <TabButton
          isActive={activeTab === "domestic"}
          onClick={() => handleTabClick("domestic")}
        >
          국내
        </TabButton>
        <TabButton
          isActive={activeTab === "overseas"}
          onClick={() => handleTabClick("overseas")}
        >
          해외
        </TabButton>
      </TabContainer>

      {/* 로딩 및 에러 처리 */}
      {isLoading && <Message>지역 목록을 불러오는 중...</Message>}
      {error && <Message>오류: {error.message}</Message>}

      {!isLoading && !error && (
        <FilterContainer>
          {activeTab === "domestic" && (
            <>
              <RegionList>
                <RegionItem
                  isSelected={selectedMain === null}
                  onClick={handleSelectAllProvinces}
                >
                  전체
                </RegionItem>
                {domesticRegions.map((province) => (
                  <RegionItem
                    key={province.province}
                    isSelected={selectedMain === province.province}
                    onClick={() => handleSelectMain(province)}
                  >
                    {province.province}
                  </RegionItem>
                ))}
              </RegionList>

              {/* 하위 지역 목록 (선택되었을 때만 표시) */}
              {selectedMain && (
                <RegionList>
                  <RegionItem
                    isSelected={finalSelection.name === selectedMain}
                    onClick={handleSelectProvinceAsFinal}
                  >
                    전체
                  </RegionItem>
                  {subRegions.map((subRegion) => (
                    <RegionItem
                      key={subRegion.id}
                      isSelected={finalSelection.id === subRegion.id}
                      onClick={() => handleSelectSub(subRegion)}
                    >
                      {subRegion.name}
                    </RegionItem>
                  ))}
                </RegionList>
              )}
            </>
          )}

          {activeTab === "overseas" && (
            <RegionList>
              <RegionItem
                isSelected={selectedMain === null}
                onClick={handleSelectAllProvinces}
              >
                전체
              </RegionItem>
              {overseasRegions.map((continent) => (
                <RegionItem
                  key={continent.province}
                  isSelected={selectedMain === continent.province}
                  onClick={() => handleSelectMain(continent)}
                >
                  {continent.province}
                </RegionItem>
              ))}
            </RegionList>
          )}

          {/* 해외 탭 2차 지역 (국가) */}
          {activeTab === "overseas" && selectedMain && (
            <RegionList>
              <RegionItem
                isSelected={finalSelection.name === selectedMain}
                onClick={handleSelectProvinceAsFinal}
              >
                전체
              </RegionItem>
              {subRegions.map((country) => (
                <RegionItem
                  key={country.id}
                  isSelected={finalSelection.id === country.id}
                  onClick={() => handleSelectSub(country)}
                >
                  {country.name}
                </RegionItem>
              ))}
            </RegionList>
          )}
        </FilterContainer>
      )}

      <ButtonContainer>
        <Button onClick={handleClear} style={{ backgroundColor: "#6c757d" }}>
          필터 해제
        </Button>
        <Button onClick={handleApply} style={{ flex: 1 }}>
          적용하기
        </Button>
      </ButtonContainer>
    </Modal>
  );
};

export default LocationFilterModal;
