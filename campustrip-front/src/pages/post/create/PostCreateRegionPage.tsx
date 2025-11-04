import React, { useState, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import { useQuery } from "@tanstack/react-query";
import {
  getAllRegions,
  type RegionList,
  type RegionDTO,
} from "../../../api/regions";
import Button from "../../../components/common/Button";
import { IoArrowBack } from "react-icons/io5";

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: relative;
  flex-shrink: 0;
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const Content = styled.main`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  flex-shrink: 0;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  padding: 14px 16px;
  border: none;
  background-color: transparent;
  color: ${({ theme, isActive }) =>
    isActive ? theme.colors.primary : theme.colors.grey};
  border-bottom: 2px solid
    ${({ theme, isActive }) =>
      isActive ? theme.colors.primary : "transparent"};
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

const RegionItem = styled.li<{ isSelected: boolean }>`
  padding: 14px 20px;
  cursor: pointer;
  background-color: ${({ theme, isSelected }) =>
    isSelected ? theme.colors.primary : "transparent"};
  color: ${({ theme, isSelected }) =>
    isSelected ? "white" : theme.colors.text};
  font-weight: ${({ isSelected }) => (isSelected ? "bold" : "normal")};

  &:hover {
    background-color: ${({ theme, isSelected }) =>
      !isSelected &&
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

const PostCreateRegionPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = usePostCreate();

  const [activeTab, setActiveTab] = useState<"domestic" | "overseas">(
    "domestic"
  );

  // 현재 선택 중인 대분류 (예: "경기도", "아시아")
  const [selectedMain, setSelectedMain] = useState<string | null>(
    // 컨텍스트의 이름으로 초기화 시도
    formData.regionName
      ? (formData.regionId ?? 0) % 100 === 0
        ? formData.regionName
        : null
      : null
  );

  // 최종 선택된 지역 (ID와 이름 모두 저장)
  const [finalSelection, setFinalSelection] = useState<{
    id: number | null;
    name: string | null;
  }>({
    id: formData.regionId,
    name: formData.regionName,
  });

  // API 호출
  const {
    data: regionData,
    isLoading,
    error,
  } = useQuery<RegionList[], Error>({
    queryKey: ["regions"],
    queryFn: getAllRegions,
  });

  // API 응답 데이터를 국내/해외로 분리
  const { domesticRegions, overseasRegions } = useMemo(() => {
    const domestic: RegionList[] = [];
    const overseas: RegionList[] = [];

    // DB기준: 100~1702는 국내, 2000 이상은 해외
    regionData?.forEach((province) => {
      const firstRegionId = province.regions[0]?.id ?? 0;
      if (firstRegionId < 2000) {
        domestic.push(province);
      } else {
        overseas.push(province);
      }
    });
    return { domesticRegions: domestic, overseasRegions: overseas };
  }, [regionData]);

  // 현재 선택된 대분류(selectedMain)에 해당하는 하위 지역 목록
  const subRegions = useMemo(() => {
    if (!selectedMain) return [];

    const dataList =
      activeTab === "domestic" ? domesticRegions : overseasRegions;
    const found = dataList.find((p) => p.province === selectedMain);
    return found ? found.regions : [];
  }, [selectedMain, domesticRegions, overseasRegions, activeTab]);

  // 핸들러 함수 (ID, Name 동시 관리)
  const handleNext = () => {
    if (!finalSelection.id || !finalSelection.name) {
      alert("지역을 선택해주세요.");
      return;
    }
    // Context에 최종 선택 지역 ID와 이름 저장
    updateFormData({
      regionId: finalSelection.id,
      regionName: finalSelection.name,
    });
    // 2단계(상세 작성) 페이지로 이동
    navigate("/posts/new/details");
  };

  // 1차 지역 (시/도 또는 대륙) 선택
  const handleSelectMain = (province: RegionList) => {
    setSelectedMain(province.province);

    // 1차 지역의 ID (예: 서울특별시 100, 아시아 2000)
    // 1차 지역은 DB에서 `region_id`가 100 단위로 끝남
    const provinceDTO = province.regions.find((r) => r.id % 100 === 0);

    if (provinceDTO) {
      setFinalSelection({ id: provinceDTO.id, name: provinceDTO.name });
    } else if (province.regions.length > 0) {
      // (예외 처리) 1차 지역 DTO가 없다면(DB 데이터 오류 시) 첫 번째 하위 지역이라도 선택
      setFinalSelection({
        id: province.regions[0].id,
        name: province.regions[0].name,
      });
    }
  };

  // 2차 지역 (시/군/구 또는 국가) 선택
  const handleSelectSub = (subRegion: RegionDTO) => {
    setFinalSelection({ id: subRegion.id, name: subRegion.name });
  };

  const handleTabClick = (tab: "domestic" | "overseas") => {
    setActiveTab(tab);
    setSelectedMain(null);
    setFinalSelection({ id: null, name: null });
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Message>지역 목록을 불러오는 중...</Message>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Message>오류가 발생했습니다: {error.message}</Message>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate("/posts")}>
          <IoArrowBack />
        </BackButton>
        <HeaderTitle>지역 선택 (1/3)</HeaderTitle>
      </Header>

      <Content>
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

        <FilterContainer>
          {/* 국내 탭 렌더링 */}
          {activeTab === "domestic" && (
            <>
              <RegionList>
                {domesticRegions.map((province) => (
                  <RegionItem
                    key={province.province} // "경기도"
                    isSelected={selectedMain === province.province}
                    onClick={() => handleSelectMain(province)}
                  >
                    {province.province}
                  </RegionItem>
                ))}
              </RegionList>

              {/* 하위 지역 목록 */}
              {selectedMain && (
                <RegionList>
                  {/* '전체' 버튼 (1차 지역 자신을 선택) */}
                  <RegionItem
                    isSelected={finalSelection.name === selectedMain} // (예: "경기도" 전체)
                    onClick={() =>
                      handleSelectMain(
                        domesticRegions.find(
                          (p) => p.province === selectedMain
                        )!
                      )
                    }
                  >
                    전체
                  </RegionItem>

                  {/* 2차 지역 목록 (시/군/구) */}
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

          {/* 해외 탭 렌더링 */}
          {activeTab === "overseas" && (
            <>
              <RegionList>
                {overseasRegions.map((continent) => (
                  <RegionItem
                    key={continent.province} // "아시아"
                    isSelected={selectedMain === continent.province}
                    onClick={() => handleSelectMain(continent)}
                  >
                    {continent.province}
                  </RegionItem>
                ))}
              </RegionList>

              {/* 하위 지역 목록 (국가) */}
              {selectedMain && (
                <RegionList>
                  <RegionItem
                    isSelected={finalSelection.name === selectedMain} // (예: "아시아" 전체)
                    onClick={() =>
                      handleSelectMain(
                        overseasRegions.find(
                          (p) => p.province === selectedMain
                        )!
                      )
                    }
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
            </>
          )}
        </FilterContainer>
      </Content>

      <Footer>
        <Button
          onClick={handleNext}
          disabled={!finalSelection.id}
          style={{ width: "100%" }}
        >
          {finalSelection.name
            ? `"${finalSelection.name}" 선택하고 다음`
            : "지역을 선택하세요"}
        </Button>
      </Footer>
    </PageContainer>
  );
};

export default PostCreateRegionPage;
