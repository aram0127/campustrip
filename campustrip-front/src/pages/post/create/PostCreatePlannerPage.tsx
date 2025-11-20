import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import { useAuth } from "../../../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyPlanners } from "../../../api/planners";
import { createPost, type CreatePostData } from "../../../api/posts";
import { type Planner } from "../../../types/planner";
import { type Post } from "../../../types/post";
import Button from "../../../components/common/Button";
import axios from "axios";
import PageLayout, {
  ScrollingContent,
} from "../../../components/layout/PageLayout";

const ScrollingListContainer = styled(ScrollingContent)`
  padding: 16px;
`;

const PlannerItem = styled.div<{ isSelected: boolean }>`
  display: block;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  border: 2px solid
    ${({ theme, isSelected }) =>
      isSelected ? theme.colors.primary : "transparent"};
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

const Footer = styled.footer`
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const FooterButton = styled(Button)`
  flex: 1;
  font-size: 16px;
`;

const PrevButton = styled(FooterButton)`
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grey};
  }
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const PostCreatePlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, resetFormData } = usePostCreate();
  const { user } = useAuth(); // 현재 로그인한 사용자 정보

  const [selectedPlannerId, setSelectedPlannerId] = useState<number | null>(
    formData.plannerId
  );

  // useQuery로 내 플래너 목록 가져오기
  const {
    data: planners = [],
    isLoading,
    error: queryError,
  } = useQuery<Planner[], Error>({
    queryKey: ["myPlanners", user?.id], // 내 플래너
    queryFn: () => getMyPlanners(user!.id),
    enabled: !!user, // 로그인한 사용자만 실행
  });

  // useMutation으로 게시글 생성 API 설정
  const {
    mutate: submitPost,
    isPending,
    error: mutationError,
  } = useMutation<
    Post, // 성공 시 Post 객체 반환
    Error, // 실패 시 Error 객체
    CreatePostData // 'variables' 타입을 CreatePostData로 명시
  >({
    mutationFn: createPost,
    onSuccess: (createdPost) => {
      alert("게시글 작성이 완료되었습니다!");
      resetFormData(); // Context 초기화
      // 생성된 게시글 상세 페이지로 이동
      navigate(`/posts/${createdPost.postId}`, { replace: true });
    },
    onError: (err) => {
      console.error("게시글 생성 실패:", err);
      // 에러 메시지는 아래 <Message> 컴포넌트에서 표시
    },
  });

  // '이전' 버튼
  const handlePrev = () => {
    updateFormData({ plannerId: selectedPlannerId });
    navigate("/posts/new/details"); // 2단계로 이동
  };

  // '작성 완료' 버튼
  const handleSubmit = () => {
    if (!selectedPlannerId) {
      alert("플래너를 선택해주세요.");
      return;
    }

    if (!user) {
      alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }

    updateFormData({ plannerId: selectedPlannerId });

    submitPost({
      formData: { ...formData, plannerId: selectedPlannerId },
      user: user,
    });
  };

  return (
    <PageLayout title="플래너 선택 (3/3)">
      <ScrollingListContainer>
        {isLoading && <Message>플래너 목록을 불러오는 중...</Message>}
        {queryError && <Message>오류: {queryError.message}</Message>}

        {!isLoading && planners.length === 0 && (
          <Message>
            사용할 수 있는 플래너가 없습니다.
            <br />
            (플래너 페이지에서 먼저 플래너를 생성해주세요.)
          </Message>
        )}

        {planners.map((planner) => (
          <PlannerItem
            key={planner.plannerId}
            isSelected={selectedPlannerId === planner.plannerId}
            onClick={() => setSelectedPlannerId(planner.plannerId)}
          >
            <PlannerTitle>{planner.title}</PlannerTitle>
            <PlannerInfo>
              📅 기간: {planner.startDate} ~ {planner.endDate}
            </PlannerInfo>
            <PlannerInfo>👥 제작자: {planner.user.name}</PlannerInfo>
          </PlannerItem>
        ))}

        {mutationError && (
          <Message style={{ color: "red" }}>
            {axios.isAxiosError(mutationError)
              ? `작성 실패 (${mutationError.response?.status}): ${mutationError.message}`
              : `작성 실패: ${mutationError.message}`}
          </Message>
        )}
      </ScrollingListContainer>

      <Footer>
        <PrevButton onClick={handlePrev} disabled={isPending}>
          이전
        </PrevButton>
        <FooterButton
          onClick={handleSubmit}
          disabled={!selectedPlannerId || isPending}
        >
          {isPending ? "생성 중..." : "작성 완료"}
        </FooterButton>
      </Footer>
    </PageLayout>
  );
};

export default PostCreatePlannerPage;
