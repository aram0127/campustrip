import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import { useAuth } from "../../../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getMyPlanners } from "../../../api/planners";
import {
  createPost,
  updatePost,
  type CreatePostData,
  type UpdatePostData,
} from "../../../api/posts";
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

const PlannerItem = styled.div<{ $isSelected: boolean }>`
  display: block;
  padding: 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: inherit;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  cursor: pointer;

  border: 2px solid
    ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.primary : "transparent"};
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

const PrevButton = styled(FooterButton)``;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const PostCreatePlannerPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData, resetFormData } = usePostCreate();
  const { user } = useAuth();

  // 모드 식별
  const { postId } = useParams<{ postId?: string }>();
  const isEditMode = !!postId;

  const [selectedPlannerId, setSelectedPlannerId] = useState<number | null>(
    formData.plannerId
  );

  // 내 플래너 목록 가져오기
  const {
    data: planners = [],
    isLoading,
    error: queryError,
  } = useQuery<Planner[], Error>({
    queryKey: ["myPlanners", user?.id],
    queryFn: () => getMyPlanners(user!.id),
    enabled: !!user,
  });

  // 게시글 생성 Mutation
  const {
    mutate: createPostMutation,
    isPending: isCreating,
    error: creationError,
  } = useMutation<Post, Error, CreatePostData>({
    mutationFn: createPost,
    onSuccess: (createdPost) => {
      alert("게시글 작성이 완료되었습니다!");
      resetFormData();
      navigate(`/posts/${createdPost.postId}`, { replace: true });
    },
    onError: (err) => {
      console.error("게시글 생성 실패:", err);
    },
  });

  // 게시글 수정 Mutation
  const {
    mutate: updatePostMutation,
    isPending: isUpdating,
    error: updateError,
  } = useMutation<Post, Error, UpdatePostData>({
    mutationFn: (data: UpdatePostData) => updatePost(postId!, data),
    onSuccess: (updatedPost) => {
      alert("게시글 수정이 완료되었습니다!");
      resetFormData();
      navigate(`/posts/${updatedPost.postId}`, { replace: true });
      // 상세 페이지 캐시 무효화 (PostDetailPage가 최신 데이터를 받도록)
      // queryClient.invalidateQueries({ queryKey: ["post", updatedPost.postId] });
      // (QueryClient가 필요하면 상단에서 useQueryClient()로 가져와야 함)
    },
    onError: (err) => {
      console.error("게시글 수정 실패:", err);
    },
  });

  // 로딩/에러 상태 통합
  const isLoadingSubmit = isCreating || isUpdating;
  const submitError = creationError || updateError;

  // '이전' 버튼
  const handlePrev = () => {
    updateFormData({ plannerId: selectedPlannerId });
    if (isEditMode) {
      navigate(`/posts/edit/${postId}/details`);
    } else {
      navigate("/posts/new/details");
    }
  };

  // 작성 완료, 수정 완료 버튼
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

    // API에 전송할 최종 데이터
    const postDataPayload = {
      formData: { ...formData, plannerId: selectedPlannerId },
      user: user,
    };

    if (isEditMode) {
      updatePostMutation(postDataPayload);
    } else {
      createPostMutation(postDataPayload);
    }
  };

  return (
    <PageLayout
      title={isEditMode ? "게시글 수정 (3/3)" : "플래너 선택 (3/3)"}
      showBackButton={false}
    >
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
            $isSelected={selectedPlannerId === planner.plannerId}
            onClick={() => setSelectedPlannerId(planner.plannerId)}
          >
            <PlannerTitle>{planner.title}</PlannerTitle>
            <PlannerInfo>
              📅 기간: {planner.startDate} ~ {planner.endDate}
            </PlannerInfo>
            <PlannerInfo>👥 제작자: {planner.userName}</PlannerInfo>
          </PlannerItem>
        ))}

        {submitError && (
          <Message style={{ color: "red" }}>
            {axios.isAxiosError(submitError)
              ? `작업 실패 (${submitError.response?.status}): ${submitError.message}`
              : `작업 실패: ${submitError.message}`}
          </Message>
        )}
      </ScrollingListContainer>

      <Footer>
        <PrevButton onClick={handlePrev} disabled={isLoadingSubmit}>
          이전
        </PrevButton>
        <FooterButton
          onClick={handleSubmit}
          disabled={!selectedPlannerId || isLoadingSubmit}
        >
          {isEditMode
            ? isLoadingSubmit
              ? "수정 중..."
              : "수정 완료"
            : isLoadingSubmit
            ? "생성 중..."
            : "작성 완료"}
        </FooterButton>
      </Footer>
    </PageLayout>
  );
};

export default PostCreatePlannerPage;
