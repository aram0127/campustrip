import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";

const PageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const PlannerListContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
  padding: 16px;
`;

const PlannerItem = styled(Link)`
  display: block;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  text-decoration: none;
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const PlannerTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PlannerInfo = styled.p`
  font-size: 14px;
  margin: 4px 0 0 0;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

// --- 임시 데이터 ---
const dummyPlanners = [
  {
    id: 1,
    title: "부산 2박 3일 여행",
    period: "2025.10.10 ~ 2025.10.12",
    members: "홍길동, 김영희",
  },
  {
    id: 2,
    title: "경주 당일치기",
    period: "2025.11.01",
    members: "나, 김철수, 박민지",
  },
  { id: 3, title: "서울 맛집 탐방 계획", period: "미정", members: "나" },
];

function PlannerListPage() {
  const handleCreatePlanner = () => {
    alert("새 플래너 생성 페이지로 이동합니다.");
  };

  return (
    <PageContainer>
      <PlannerListContainer>
        {dummyPlanners.map((planner) => (
          <PlannerItem to={`/planner/${planner.id}`} key={planner.id}>
            <PlannerTitle>{planner.title}</PlannerTitle>
            <PlannerInfo>📅 기간: {planner.period}</PlannerInfo>
            <PlannerInfo>👥 참여자: {planner.members}</PlannerInfo>
          </PlannerItem>
        ))}
      </PlannerListContainer>
      <FloatingActionButton onClick={handleCreatePlanner} />
    </PageContainer>
  );
}

export default PlannerListPage;
