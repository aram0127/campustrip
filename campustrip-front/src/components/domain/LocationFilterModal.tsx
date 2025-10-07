import React, { useState } from 'react';
import styled from 'styled-components';
import Modal from '../common/Modal';
import Button from '../common/Button';

interface DomesticLocations {
  [key: string]: string[];
}

interface LocationsData {
  domestic: DomesticLocations;
  overseas: string[];
}

// 상세 지역 데이터 구조 정의(임시)
export const locationsData: LocationsData = {
  domestic: {
    '서울특별시': [], '부산광역시': [], '대구광역시': [], '인천광역시': [], '광주광역시': [], '대전광역시': [], '울산광역시': [], '세종시': [],
    '경기도': [], '강원도': [], '충청북도': [], '충청남도': [], '전라북도': [], '전라남도': [], '경상북도': ['경산시', '경주시', '고령군', '구미시', '김천시'], '경상남도': [], '제주도': [],
  },
  overseas: ['일본', '중국', '베트남', '태국', '필리핀', '미국', '대만', '싱가포르', '말레이시아'],
};

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.text};
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  margin-bottom: 16px;
`;

const TabButton = styled.button<{ isActive: boolean }>`
  padding: 10px 16px;
  border: none;
  background-color: transparent;
  color: ${({ theme, isActive }) => (isActive ? theme.colors.primary : theme.colors.grey)};
  border-bottom: 2px solid ${({ theme, isActive }) => (isActive ? theme.colors.primary : 'transparent')};
  cursor: pointer;
  font-size: 16px;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  height: 300px;
`;

const RegionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  overflow-y: auto;
  flex: 1;
`;

const RegionItem = styled.li<{ isSelected: boolean }>`
  padding: 10px;
  border-radius: 4px;
  cursor: pointer;
  background-color: ${({ theme, isSelected }) => (isSelected ? theme.colors.primary : 'transparent')};
  color: ${({ theme, isSelected }) => (isSelected ? 'white' : theme.colors.text)};

  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#FFFFFF' ? '#f1f1f1' : '#333'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 20px;
`;

interface LocationFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (location: string) => void;
}

const LocationFilterModal: React.FC<LocationFilterModalProps> = ({ isOpen, onClose, onApply }) => {
  const [activeTab, setActiveTab] = useState<'domestic' | 'overseas'>('domestic');
  const [selectedMain, setSelectedMain] = useState<string | null>(null);
  const [finalSelection, setFinalSelection] = useState('전체');

  const handleApply = () => {
    // '국내' 탭이 활성화되어 있고, '전체'가 선택된 경우 '국내 전체'를 전달
    if (activeTab === 'domestic' && finalSelection === '전체') {
      onApply('국내 전체');
    } else if (activeTab === 'overseas' && finalSelection === '전체') {
      onApply('해외 전체');
    } else {
      onApply(finalSelection);
    }
    onClose();
  };
  
  const handleClear = () => {
    onApply('전체'); // '전체'를 전달하여 필터 해제
    onClose();
  };
  
  const mainRegions = Object.keys(locationsData.domestic);
  const subRegions = selectedMain ? locationsData.domestic[selectedMain as keyof typeof locationsData.domestic] : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Title>어디로 떠나시나요?</Title>
      <TabContainer>
        <TabButton isActive={activeTab === 'domestic'} onClick={() => { setActiveTab('domestic'); setFinalSelection('전체'); setSelectedMain(null); }}>국내</TabButton>
        <TabButton isActive={activeTab === 'overseas'} onClick={() => { setActiveTab('overseas'); setFinalSelection('전체'); setSelectedMain(null); }}>해외</TabButton>
      </TabContainer>
      
      <FilterContainer>
        {activeTab === 'domestic' && (
          <>
            <RegionList>
              <RegionItem isSelected={finalSelection === '전체'} onClick={() => { setSelectedMain(null); setFinalSelection('전체'); }}>전체</RegionItem>
              {mainRegions.map(region => (
                <RegionItem 
                  key={region}
                  isSelected={selectedMain === region}
                  onClick={() => { setSelectedMain(region); setFinalSelection(region); }}
                >
                  {region}
                </RegionItem>
              ))}
            </RegionList>
            {/* 시/군/구 목록 (데이터가 있는 경우에만 표시) */}
            {selectedMain && subRegions.length > 0 && (
              <RegionList>
                {subRegions.map(subRegion => (
                  <RegionItem
                    key={subRegion}
                    isSelected={finalSelection === subRegion}
                    onClick={() => setFinalSelection(subRegion)}
                  >
                    {subRegion}
                  </RegionItem>
                ))}
              </RegionList>
            )}
          </>
        )}
        {activeTab === 'overseas' && (
          <RegionList>
            <RegionItem isSelected={finalSelection === '전체'} onClick={() => setFinalSelection('전체')}>전체</RegionItem>
            {locationsData.overseas.map(country => (
              <RegionItem 
                key={country}
                isSelected={finalSelection === country}
                onClick={() => setFinalSelection(country)}
              >
                {country}
              </RegionItem>
            ))}
          </RegionList>
        )}
      </FilterContainer>

      <ButtonContainer>
        <Button onClick={handleClear} style={{ backgroundColor: '#6c757d' }}>필터 해제</Button>
        <Button onClick={handleApply} style={{ flex: 1 }}>적용하기</Button>
      </ButtonContainer>
    </Modal>
  );
};

export default LocationFilterModal;