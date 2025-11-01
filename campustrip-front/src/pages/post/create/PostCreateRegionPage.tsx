import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import { locationsData } from "../../../components/domain/LocationFilterModal";
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

const PostCreateRegionPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = usePostCreate();

  const [activeTab, setActiveTab] = useState<"domestic" | "overseas">(
    "domestic"
  );
  // 현재 선택 중인 대분류 (예: "경상북도")
  const [selectedMain, setSelectedMain] = useState<string | null>(
    formData.region // Context에 저장된 값으로 초기화
  );
  // 최종 선택된 지역 (예: "구미시" 또는 "경상북도")
  const [finalSelection, setFinalSelection] = useState<string | null>(
    formData.region
  );

  const mainRegions = Object.keys(locationsData.domestic);
  const subRegions = selectedMain
    ? locationsData.domestic[
        selectedMain as keyof typeof locationsData.domestic
      ]
    : [];

  const handleNext = () => {
    if (!finalSelection) {
      alert("지역을 선택해주세요.");
      return;
    }
    // Context에 최종 선택 지역 저장
    updateFormData({ region: finalSelection });
    // 2단계(상세 작성) 페이지로 이동
    navigate("/posts/new/details");
  };

  const handleSelectMain = (region: string) => {
    setSelectedMain(region);
    // 하위 지역이 없으면, 대분류 자체가 최종 선택임
    if (locationsData.domestic[region]?.length === 0) {
      setFinalSelection(region);
    } else {
      // 하위 지역이 있으면, '전체' (즉, 대분류)를 기본 선택으로 둠
      setFinalSelection(region);
    }
  };

  const handleSelectSub = (subRegion: string) => {
    setFinalSelection(subRegion);
  };

  const handleSelectOverseas = (country: string) => {
    setSelectedMain(country); // 해외는 대분류=최종선택
    setFinalSelection(country);
  };

  const handleTabClick = (tab: "domestic" | "overseas") => {
    setActiveTab(tab);
    setSelectedMain(null);
    setFinalSelection(null);
  };

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
          {activeTab === "domestic" && (
            <>
              <RegionList>
                {mainRegions.map((region) => (
                  <RegionItem
                    key={region}
                    isSelected={selectedMain === region}
                    onClick={() => handleSelectMain(region)}
                  >
                    {region}
                  </RegionItem>
                ))}
              </RegionList>

              {/* 하위 지역 목록 (선택되었고, 하위 지역이 있을 때만 표시) */}
              {selectedMain && subRegions.length > 0 && (
                <RegionList>
                  <RegionItem
                    isSelected={finalSelection === selectedMain} // (예: "경상북도" 전체)
                    onClick={() => setFinalSelection(selectedMain)}
                  >
                    전체
                  </RegionItem>
                  {subRegions.map((subRegion) => (
                    <RegionItem
                      key={subRegion}
                      isSelected={finalSelection === subRegion}
                      onClick={() => handleSelectSub(subRegion)}
                    >
                      {subRegion}
                    </RegionItem>
                  ))}
                </RegionList>
              )}
            </>
          )}

          {activeTab === "overseas" && (
            <RegionList>
              {locationsData.overseas.map((country) => (
                <RegionItem
                  key={country}
                  isSelected={finalSelection === country}
                  onClick={() => handleSelectOverseas(country)}
                >
                  {country}
                </RegionItem>
              ))}
            </RegionList>
          )}
        </FilterContainer>
      </Content>

      <Footer>
        <Button
          onClick={handleNext}
          disabled={!finalSelection}
          style={{ width: "100%" }}
        >
          {finalSelection
            ? `"${finalSelection}" 선택하고 다음`
            : "지역을 선택하세요"}
        </Button>
      </Footer>
    </PageContainer>
  );
};

export default PostCreateRegionPage;
