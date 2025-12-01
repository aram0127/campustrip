import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import { useQuery } from "@tanstack/react-query";
import {
  getAllRegions,
  type RegionList,
  type RegionDTO,
} from "../../../api/regions";
import Button from "../../../components/common/Button";
import { IoClose } from "react-icons/io5";
import PageLayout, {
  ScrollingContent,
} from "../../../components/layout/PageLayout";

const ScrollableContent = styled(ScrollingContent)`
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  flex-shrink: 0;
`;

const TabButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 14px 16px;
  border: none;
  background-color: transparent;
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.primary : theme.colors.grey};
  border-bottom: 2px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.primary : "transparent"};
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const FilterContainer = styled.div`
  display: flex;
  flex-grow: 1;
  height: 0;
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

const RegionItem = styled.li<{ $isSelected: boolean }>`
  padding: 14px 20px;
  cursor: pointer;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.primary : "transparent"};
  color: ${({ theme, $isSelected }) =>
    $isSelected ? "white" : theme.colors.text};
  font-weight: ${({ $isSelected }) => ($isSelected ? "bold" : "normal")};

  &:hover {
    background-color: ${({ theme, $isSelected }) =>
      !$isSelected &&
      (theme.colors.background === "#FFFFFF" ? "#f1f1f1" : "#333")};
  }
`;

const Footer = styled.footer`
  padding: 10px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const SelectedRegionsContainer = styled.div`
  flex-shrink: 0;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  min-height: 24px;
`;

const RegionTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 6px 10px;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;
`;

const RemoveTagButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const PostCreateRegionPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = usePostCreate();

  // 수정 모드인지 확인
  const { postId } = useParams<{ postId?: string }>();
  const isEditMode = !!postId;

  const [activeTab, setActiveTab] = useState<"domestic" | "overseas">(
    "domestic"
  );
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [selectedRegions, setSelectedRegions] = useState<RegionDTO[]>(
    formData.regions // 컨텍스트에서 초기값 로드
  );
  const {
    data: regionData,
    isLoading,
    error,
  } = useQuery<RegionList[], Error>({
    queryKey: ["regions"],
    queryFn: getAllRegions,
    staleTime: 1000 * 60 * 60,
  });

  // API 응답 데이터를 국내/해외로 분리
  const { domesticRegions, overseasRegions } = useMemo(() => {
    const domestic: RegionList[] = [];
    const overseas: RegionList[] = [];

    // DB기준: 100~1702는 국내, 2000 이상은 해외
    if (!regionData) return { domesticRegions: [], overseasRegions: [] };
    regionData.forEach((province) => {
      const firstChildId = province.regions[0]?.id ?? 0;
      if (firstChildId > 0 && firstChildId < 2000) {
        domestic.push(province);
      } else if (firstChildId >= 2000) {
        overseas.push(province);
      }
    });

    // 페이지 로드 시, 1차 지역(selectedMain)을 복원
    if (formData.regions.length > 0 && !selectedMain) {
      const lastSelected = formData.regions[formData.regions.length - 1];
      const parentId = Math.floor(lastSelected.id / 100) * 100;
      const list = parentId < 2000 ? domestic : overseas;
      const province = list.find((p) => {
        const firstChildId = p.regions[0]?.id ?? 0;
        return Math.floor(firstChildId / 100) * 100 === parentId;
      });
      if (province) setSelectedMain(province.province);
    }
    return { domesticRegions: domestic, overseasRegions: overseas };
  }, [regionData]);

  // 현재 선택된 대분류(selectedMain)에 해당하는 하위 지역 목록
  const subRegions = useMemo(() => {
    if (!selectedMain) return [];

    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const found = dataList.find((p) => p.province === selectedMain);
    return found ? found.regions.filter((r) => r.id % 100 !== 0) : [];
  }, [selectedMain, domesticRegions, overseasRegions, activeTab]);

  // 1차 지역 ID를 추론하는 헬퍼 함수
  const getParentDTO = (province: RegionList | undefined): RegionDTO | null => {
    if (!province) return null;

    const parentName = province.province;
    // 1차 지역 ID는 2차 지역 ID에서 추론
    const firstChildId = province.regions[0]?.id ?? 0;

    if (firstChildId > 0) {
      const parentId = Math.floor(firstChildId / 100) * 100;
      return { id: parentId, name: parentName };
    }
    return null;
  };

  // 핸들러 함수
  const handleSelectRegion = (region: RegionDTO) => {
    setSelectedRegions((prev) => {
      const isParent = region.id % 100 === 0;
      const parentId = Math.floor(region.id / 100) * 100;
      let newState = [...prev];

      if (isParent) {
        // 1차 지역(예: 부산광역시) 선택 시,
        // 기존에 선택된 하위 지역(예: 해운대구)을 모두 제거
        newState = newState.filter(
          (r) => Math.floor(r.id / 100) * 100 !== region.id
        );
        // 1차 지역 태그 추가
        if (!newState.some((r) => r.id === region.id)) {
          newState.push(region);
        }
      } else {
        // 2차 지역(예: 해운대구) 선택 시,
        // 1차 지역 태그(예: 부산광역시)가 있다면 제거
        newState = newState.filter((r) => r.id !== parentId);
        // 2차 지역 태그 추가
        if (!newState.some((r) => r.id === region.id)) {
          newState.push(region);
        }
      }
      // 다른 1차/2차 지역은 유지됨 (예: 서울특별시 종로구)
      return newState;
    });
  };

  const handleRemoveRegion = (idToRemove: number) => {
    setSelectedRegions((prev) => prev.filter((r) => r.id !== idToRemove));
  };

  const handleNext = () => {
    if (selectedRegions.length === 0) {
      alert("지역을 1개 이상 선택해주세요.");
      return;
    }
    updateFormData({ regions: selectedRegions });

    // 수정 모드와 생성 모드에 따라 경로를 동적으로 설정
    const path = isEditMode
      ? `/posts/edit/${postId}/details`
      : "/posts/new/details";

    navigate(path, { replace: true });
  };

  // 1차 지역 (시/도 또는 대륙) 선택
  const handleSelectMain = (province: RegionList) => {
    setSelectedMain(province.province);

    // 2차 지역이 0개인 경우(DB상 세종시), 1차 지역을 바로 선택
    if (province.regions.filter((r) => r.id % 100 !== 0).length === 0) {
      const parentDTO = getParentDTO(province);
      if (parentDTO) {
        handleSelectRegion(parentDTO);
      }
    }
  };

  // 1차 지역의 "전체" 버튼 클릭 시
  const handleSelectProvinceAsFinal = () => {
    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const province = dataList.find((p) => p.province === selectedMain);

    // 1차 지역 DTO(예: {id: 200, name: "부산광역시"})를 헬퍼로 생성
    const parentDTO = getParentDTO(province);

    if (parentDTO) {
      handleSelectRegion(parentDTO);
    }
  };

  // 2차 지역 (시/군/구 또는 국가) 선택
  const handleSelectSub = (subRegion: RegionDTO) => {
    // 1차 지역 이름(예: 부산광역시)을 selectedMain State에서 가져옴
    const parentName = selectedMain;

    // "부산광역시 중구" 형태의 full name을 생성
    const fullName = parentName
      ? `${parentName} ${subRegion.name}`
      : subRegion.name;

    // ID는 2차 지역 ID, name은 full name을 가진 새 DTO 객체를 생성
    const fullRegionDTO: RegionDTO = {
      id: subRegion.id,
      name: fullName,
    };

    handleSelectRegion(fullRegionDTO);
  };

  const handleTabClick = (tab: "domestic" | "overseas") => {
    setActiveTab(tab);
    setSelectedMain(null);
    // 탭을 바꿔도 기존 선택(selectedRegions)은 유지
  };

  // 2차 목록에서 '전체'의 선택 여부
  const isParentSelected = useMemo(() => {
    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const province = dataList.find((p) => p.province === selectedMain);

    // 1차 지역 DTO를 헬퍼로 생성
    const parentDTO = getParentDTO(province);
    if (!parentDTO) return false;

    // 1차 지역 ID가 selectedRegions 배열에 있는지 확인
    return selectedRegions.some((r) => r.id === parentDTO.id);
  }, [selectedMain, selectedRegions, domesticRegions, overseasRegions]);

  const isSubSelected = (id: number) =>
    selectedRegions.some((r) => r.id === id);

  if (isLoading) {
    return (
      <PageLayout
        title={isEditMode ? "게시글 수정 (1/3)" : "지역 선택 (1/3)"}
        showBackButton={false}
      >
        <Message>지역 목록을 불러오는 중...</Message>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout
        title={isEditMode ? "게시글 수정 (1/3)" : "지역 선택 (1/3)"}
        showBackButton={false}
      >
        <Message>오류가 발생했습니다: {error.message}</Message>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={isEditMode ? "게시글 수정 (1/3)" : "지역 선택 (1/3)"}
      onBackClick={() => {
        isEditMode ? navigate(`/posts/${postId}`) : navigate("/posts");
      }}
    >
      <ScrollableContent>
        <TabContainer>
          <TabButton
            $isActive={activeTab === "domestic"}
            onClick={() => handleTabClick("domestic")}
          >
            국내
          </TabButton>
          <TabButton
            $isActive={activeTab === "overseas"}
            onClick={() => handleTabClick("overseas")}
          >
            해외
          </TabButton>
        </TabContainer>

        <FilterContainer>
          {activeTab === "domestic" && (
            <RegionList>
              {domesticRegions.map((province) => (
                <RegionItem
                  key={province.province}
                  $isSelected={selectedMain === province.province}
                  onClick={() => handleSelectMain(province)}
                >
                  {province.province}
                </RegionItem>
              ))}
            </RegionList>
          )}

          {activeTab === "domestic" && selectedMain && (
            <RegionList>
              <RegionItem
                $isSelected={isParentSelected} // 수정된 헬퍼 사용
                onClick={handleSelectProvinceAsFinal} // 수정된 핸들러 사용
              >
                전체
              </RegionItem>
              {subRegions.map((subRegion) => (
                <RegionItem
                  key={subRegion.id}
                  $isSelected={isSubSelected(subRegion.id)}
                  onClick={() => handleSelectSub(subRegion)}
                >
                  {subRegion.name}
                </RegionItem>
              ))}
            </RegionList>
          )}

          {activeTab === "overseas" && (
            <RegionList>
              {overseasRegions.map((continent) => (
                <RegionItem
                  key={continent.province}
                  $isSelected={selectedMain === continent.province}
                  onClick={() => handleSelectMain(continent)}
                >
                  {continent.province}
                </RegionItem>
              ))}
            </RegionList>
          )}

          {activeTab === "overseas" && selectedMain && (
            <RegionList>
              <RegionItem
                $isSelected={isParentSelected}
                onClick={handleSelectProvinceAsFinal}
              >
                전체
              </RegionItem>
              {subRegions.map((country) => (
                <RegionItem
                  key={country.id}
                  $isSelected={isSubSelected(country.id)}
                  onClick={() => handleSelectSub(country)}
                >
                  {country.name}
                </RegionItem>
              ))}
            </RegionList>
          )}
        </FilterContainer>
      </ScrollableContent>
      <SelectedRegionsContainer>
        {selectedRegions.map((region) => (
          <RegionTag key={region.id}>
            {region.name}
            <RemoveTagButton onClick={() => handleRemoveRegion(region.id)}>
              <IoClose />
            </RemoveTagButton>
          </RegionTag>
        ))}
      </SelectedRegionsContainer>
      <Footer>
        <Button
          onClick={handleNext}
          disabled={selectedRegions.length === 0}
          style={{ width: "100%" }}
        >
          {selectedRegions.length > 0
            ? `${selectedRegions.length}개 지역 선택하고 다음`
            : "지역을 선택하세요"}
        </Button>
      </Footer>
    </PageLayout>
  );
};

export default PostCreateRegionPage;
