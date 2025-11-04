import styled from "styled-components";
import { Link } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { useQuery } from "@tanstack/react-query";
import { getMyPlanners } from "../../api/planners";
import { useAuth } from "../../context/AuthContext";
import { type Planner } from "../../types/planner";

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

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

function PlannerListPage() {
  const { user } = useAuth();

  // useQuery로 플래너 목록 가져오기
  const {
    data: planners = [],
    isLoading,
    error,
  } = useQuery<Planner[], Error>({
    queryKey: ["myPlanners", user?.id],
    queryFn: () => getMyPlanners(user!.id),
    enabled: !!user,
  });

  const handleCreatePlanner = () => {
    alert("새 플래너 생성 페이지로 이동합니다.");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Message>플래너 목록을 불러오는 중...</Message>
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
      <PlannerListContainer>
        {planners.length === 0 ? (
          <Message>생성된 플래너가 없습니다.</Message>
        ) : (
          planners.map((planner) => (
            <PlannerItem
              to={`/planner/${planner.plannerId}`}
              key={planner.plannerId}
            >
              <PlannerTitle>{planner.title}</PlannerTitle>
              <PlannerInfo>
                📅 기간: {planner.startDate} ~ {planner.endDate}
              </PlannerInfo>
              <PlannerInfo>👥 제작자: {planner.user.name}</PlannerInfo>
            </PlannerItem>
          ))
        )}
      </PlannerListContainer>
      <FloatingActionButton onClick={handleCreatePlanner} />
    </PageContainer>
  );
}

export default PlannerListPage;
