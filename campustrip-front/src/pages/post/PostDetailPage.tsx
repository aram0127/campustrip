import React, { useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById } from "../../api/posts";
import { createApplication, cancelApplication } from "../../api/applications";
import { type Post } from "../../types/post";
import { type Application } from "../../types/application";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import axios, { type AxiosError } from "axios";

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 10;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  top: 56px; /* Header height */
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 9;
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 14px;
  border: none;
  background-color: transparent;
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.secondaryTextColor};
  font-size: 16px;
  cursor: pointer;
  border-bottom: 2px solid
    ${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
`;

const ContentContainer = styled.main`
  padding: 20px;
`;

const AuthorInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
`;

const AuthorAvatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const AuthorName = styled.div`
  font-weight: bold;
`;

const PostTitle = styled.h1`
  font-size: 22px;
  margin: 0 0 24px 0;
`;

const PostMeta = styled.div`
  margin-bottom: 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding: 16px 0;
`;

const MetaItem = styled.div`
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  &:last-child {
    margin-bottom: 0;
  }
  span {
    color: ${({ theme }) => theme.colors.text};
    font-weight: 500;
  }
`;

const PostBody = styled.div`
  line-height: 1.6;
  min-height: 150px;
  margin-bottom: 30px;
  white-space: pre-wrap;
`;

type ButtonStatus = "apply" | "cancel" | "accepted" | "rejected";

const ActionButton = styled.button<{ status: ButtonStatus }>`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  ${({ theme, status }) =>
    status === "apply" &&
    css`
      background-color: ${theme.colors.primary};
      color: white;
      &:hover {
        background-color: #0056b3; // 더 진한 파란색
      }
    `}

  ${({ theme, status }) =>
    status === "cancel" &&
    css`
      background-color: ${theme.colors.error}; // 취소 버튼은 빨간색
      color: white;
      &:hover {
        background-color: #c82333; // 더 진한 빨간색
      }
    `}

${({ theme, status }) =>
    (status === "accepted" || status === "rejected") &&
    css`
      background-color: ${theme.colors.grey};
      color: ${theme.colors.background};
      cursor: not-allowed;
    `}
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey};
    cursor: not-allowed;
  }
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  text-align: center;
  margin-bottom: 16px;
`;

interface ApplicationData {
  post: { postId: number };
  user: { userId: string };
}

interface CancelApplicationData {
  userId: number;
  postId: number;
}

type ApplicationStatus = "NOT_APPLIED" | "PENDING" | "ACCEPTED" | "REJECTED";

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"post" | "planner">("post");

  const {
    data: post,
    isLoading,
    error: queryError,
  } = useQuery<Post, Error>({
    // queryKey: 쿼리를 식별하는 고유한 키 배열
    // postId가 바뀔 때마다 쿼리가 자동으로 다시 실행됨
    queryKey: ["post", postId],
    // queryFn: 데이터를 가져오는 함수
    queryFn: () => getPostById(postId!), // '!'는 postId가 undefined가 아님을 단언
    // enabled: 이 쿼리가 실행되어야 하는 조건
    enabled: !!postId, // postId가 존재할 때만 쿼리를 실행
  });

  // 현재 사용자의 신청 상태와 ID를 useMemo로 계산
  const { applicationStatus, applicationId } = useMemo(() => {
    if (!user || !post?.applications) {
      return {
        applicationStatus: "NOT_APPLIED" as ApplicationStatus,
        applicationId: null,
      };
    }

    const currentUserApplication = post.applications.find(
      (app) => app.userId === user.userId
    );

    if (!currentUserApplication) {
      return {
        applicationStatus: "NOT_APPLIED" as ApplicationStatus,
        applicationId: null,
      };
    }

    // applicationStatus: true(수락), false(거절), null(대기중)
    // 'true' (수락) 상태
    if (currentUserApplication.applicationStatus === true) {
      return {
        applicationStatus: "ACCEPTED" as ApplicationStatus,
        applicationId: currentUserApplication.id,
      };
    }
    // 'false' (거절) 상태
    if (currentUserApplication.applicationStatus === false) {
      return {
        applicationStatus: "REJECTED" as ApplicationStatus,
        applicationId: currentUserApplication.id,
      };
    }
    // 'null' (대기중)
    return {
      applicationStatus: "PENDING" as ApplicationStatus,
      applicationId: currentUserApplication.id,
    };
  }, [post?.applications, user]);

  // '동행 신청' useMutation
  const {
    mutate: applyForTrip, // isPending을 isApplying으로 이름 변경
    isPending: isApplying, // error를 applyError로 이름 변경
    error: applyError,
  } = useMutation<Application, Error, ApplicationData>({
    mutationFn: createApplication, // API 함수 연결
    onSuccess: () => {
      // 성공 시 로직
      alert("동행 신청이 완료되었습니다.");
      // 'post' 쿼리를 무효화하여 최신 데이터(신청 목록)를 다시 불러옴
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (err: Error) => {
      // 실패 시 로직
      console.error("동행 신청 실패:", err);
    },
  });

  // '신청 취소' useMutation
  const {
    mutate: cancelTripApplication,
    isPending: isCanceling,
    error: cancelError, // 신청 취소 에러
  } = useMutation<void, Error, CancelApplicationData>({
    mutationFn: cancelApplication,
    onSuccess: () => {
      alert("신청이 취소되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["post", postId] });
    },
    onError: (err: Error) => {
      console.error("신청 취소 실패:", err);
    },
  });

  // 버튼 클릭 핸들러: 현재 상태에 따라 다른 뮤테이션 호출
  const handleButtonClick = () => {
    if (!user || !post) return;

    if (isMyPost) {
      navigate(`/posts/${post.postId}/applicants`);
      return;
    }

    switch (applicationStatus) {
      case "NOT_APPLIED":
        applyForTrip({
          post: { postId: post.postId },
          user: { userId: user.userId },
        });
        break;
      case "PENDING":
        cancelTripApplication({
          userId: user.id,
          postId: post.postId,
        });
        break;
      case "ACCEPTED":
      case "REJECTED":
        break;
    }
  };

  if (isLoading) {
    return <Message>로딩 중...</Message>;
  }

  if (queryError) {
    return <Message>{queryError.message}</Message>;
  }

  if (!post) {
    return <Message>게시글 정보를 찾을 수 없습니다.</Message>;
  }

  const isMyPost = user?.id === post.user.id;
  const isMutationLoading = isApplying || isCanceling;

  // 버튼 텍스트와 스타일 상태 결정
  const getButtonProps = () => {
    if (isMyPost) {
      return {
        text: "동행 신청자 목록",
        status: "apply" as ButtonStatus,
        disabled: false,
      };
    }
    if (isMutationLoading) {
      return {
        text: "처리 중...",
        status: "accepted" as ButtonStatus,
        disabled: true,
      };
    }

    switch (applicationStatus) {
      case "ACCEPTED":
        return {
          text: "신청 됨",
          status: "accepted" as ButtonStatus,
          disabled: true,
        };
      case "REJECTED":
        return {
          text: "거절됨",
          status: "rejected" as ButtonStatus,
          disabled: true,
        };
      case "PENDING":
        return {
          text: "신청 취소",
          status: "cancel" as ButtonStatus,
          disabled: false,
        };
      case "NOT_APPLIED":
      default:
        return {
          text: "동행 신청하기",
          status: "apply" as ButtonStatus,
          disabled: false,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <PageContainer>
      <Header>
        <BackButton onClick={() => navigate(-1)}>
          <IoArrowBack />
        </BackButton>
        <HeaderTitle>게시글</HeaderTitle>
      </Header>

      <TabMenu>
        <TabButton
          active={activeTab === "post"}
          onClick={() => setActiveTab("post")}
        >
          게시글
        </TabButton>
        <TabButton
          active={activeTab === "planner"}
          onClick={() => setActiveTab("planner")}
        >
          플래너
        </TabButton>
      </TabMenu>

      {activeTab === "post" && (
        <ContentContainer>
          <AuthorInfo>
            <AuthorAvatar />
            <AuthorName>{post.user?.name || "작성자"}</AuthorName>
            <span>여행 온도: 🌡{post.user.userScore}</span>
          </AuthorInfo>

          <PostTitle>{post.title}</PostTitle>

          <PostMeta>
            <MetaItem>
              📍 지역:{" "}
              <span>
                {post.regions?.map((r) => r.regionName).join(", ") ||
                  "정보 없음"}
              </span>
            </MetaItem>
            <MetaItem>
              📅 일정: <span>기간 정보 없음</span>
            </MetaItem>
            <MetaItem>
              👥 모집 인원:{" "}
              <span>
                {post.memberSize} / {post.teamSize} 명
              </span>
            </MetaItem>
          </PostMeta>

          <PostBody>{post.body}</PostBody>

          {/* 신청/취소 에러 메시지 표시 */}
          {(applyError || cancelError) && (
            <ErrorMessage>신청 처리 중 오류가 발생했습니다.</ErrorMessage>
          )}

          {/* ActionButton에 동적 props 전달 */}
          <ActionButton
            onClick={handleButtonClick}
            status={buttonProps.status}
            disabled={buttonProps.disabled}
          >
            {buttonProps.text}
          </ActionButton>
        </ContentContainer>
      )}

      {activeTab === "planner" && (
        <ContentContainer>
          <p>플래너 기능은 준비 중</p>
        </ContentContainer>
      )}
    </PageContainer>
  );
};

export default PostDetailPage;
