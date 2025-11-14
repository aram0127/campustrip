import React, { useState, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom"; // URL에서 ID를 가져오기 위해 사용
// Google Maps API를 사용하기 위한 라이브러리
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";

// 스타일 컴포넌트 
const PageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 100vh; /* 전체 높이 */
`;

const MapSection = styled.div`
  width: 100%;
  height: 250px; /* 지도 섹션 높이 고정 */
  position: sticky;
  top: 0;
  z-index: 10;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 20px;
  background-color: white; /* 지도 위에 콘텐츠 올라갈 수 있게 배경색 지정 */
  z-index: 20;
`;

const DetailTitle = styled.h1`
  font-size: 24px;
  margin-bottom: 10px;
  color: ${({ theme }) => theme.colors.text};
`;

const DetailInfo = styled.p`
  font-size: 16px;
  margin: 8px 0;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ScheduleSection = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
`;

const ScheduleItem = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
`;

const ItemNumber = styled.span`
  display: inline-flex;
  justify-content: center;
  align-items: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #ff5722; /* 임시 색상 */
  color: white;
  font-size: 14px;
  margin-right: 10px;
  font-weight: bold;
`;

const ItemName = styled.span`
  flex-grow: 1;
  font-size: 16px;
`;

// 임시 데이터(ListPage의 더미 데이터에서 추가) 
const dummyPlannerDetails = [
  {
    id: 1,
    title: "부산 2박 3일 여행",
    period: "2025.10.10 ~ 2025.10.12",
    members: ["홍길동", "김영희"],
    // 내용 추가
    location: "부산",
    schedule: "1일차: 해운대, 2일차: 광안리, 3일차: 마무리",
  },
  {
    id: 2,
    title: "경주 당일치기",
    period: "2025.11.01",
    members: ["나", "김철수", "박민지"],
    location: "경주",
    schedule: "황리단길, 첨성대, 불국사",
  },
  // 나머지 플래너 데이터
];

// 메인 컴포넌트
function PlannerDetailPage() {
  // 1. URL에서 :id 값(플래너 ID) 가져옴
  const { id } = useParams();
  const plannerId = parseInt(id);

  // 2. 상태 관리를 위한 state 정의
  const [planner, setPlanner] = useState(null);
  const [loading, setLoading] = useState(true);

  // 3. 컴포넌트가 마운트되거나 ID가 변경될 때 데이터를 불러
  useEffect(() => {
    // 실제로 여기에 API 호출 코드를 넣음
    
    // 현재는 더미 데이터
    const fetchedPlanner = dummyPlannerDetails.find(p => p.id === plannerId);
    
    // 데이터 로딩 시뮬레이션
    setTimeout(() => {
        setPlanner(fetchedPlanner);
        setLoading(false);
    }, 500);

  }, [plannerId]); // id 변경될 때마다 실행

  if (loading) {
    return <PageContainer>로딩 중...</PageContainer>;
  }

  if (!planner) {
    return <PageContainer>플래너 정보를 찾을 수 없습니다.</PageContainer>;
  }

  return (
    <PageContainer>
      <DetailTitle>{planner.title}</DetailTitle>
      
      {/* 기본 정보 */}
      <DetailInfo>🗺️ 장소: {planner.location}</DetailInfo>
      <DetailInfo>📅 기간: {planner.period}</DetailInfo>
      <DetailInfo>👥 참여자: {planner.members.join(", ")}</DetailInfo>

      {/* 상세 일정 */}
      <ScheduleSection>
        <h3>상세 일정</h3>
        <p>{planner.schedule}</p>
        {/* 지도, 시간별 일정표 등의 상세 UI 들어가는 부분 */}
      </ScheduleSection>

      
      {/* 수정/삭제 버튼 등의 추가 */}
    </PageContainer>
  );
}

export default PlannerDetailPage;