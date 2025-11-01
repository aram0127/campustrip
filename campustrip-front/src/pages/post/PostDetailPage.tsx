import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getPostById } from "../../api/posts";
import { createApplication } from "../../api/applications";
import { type Post } from "../../types/post";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

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

const ActionButton = styled.button`
  width: 100%;
  padding: 14px;
  border-radius: 8px;
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;

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

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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

  const {
    mutate: applyForTrip,
    isPending: isApplying, // isPending을 isApplying으로 이름 변경
    error: applyError, // error를 applyError로 이름 변경
  } = useMutation({
    mutationFn: createApplication, // API 함수 연결
    onSuccess: () => {
      // 성공 시 로직
      alert("동행 신청이 완료되었습니다.");
    },
    onError: (err: Error) => {
      // 실패 시 로직
      console.error("동행 신청 실패:", err);
    },
  });

  const handleApply = async () => {
    if (!user || !post) {
      alert("로그인 정보 또는 게시글 정보가 유효하지 않습니다.");
      return;
    }

    if (user.id === post.user.id) {
      alert("자신이 작성한 게시글에는 동행을 신청할 수 없습니다.");
      return;
    }

    // useMutation의 mutate 함수(applyForTrip) 호출
    const applicationData = {
      post: { postId: post.postId },
      user: { userId: user.userId },
    };
    applyForTrip(applicationData);
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
              👥 모집 인원: <span>? / {post.teamSize} 명</span>
            </MetaItem>
          </PostMeta>

          <PostBody>{post.body}</PostBody>
          {applyError && (
            <ErrorMessage>
              {axios.isAxiosError(applyError) &&
              applyError.response?.status === 500
                ? "이미 신청했거나 처리 중 오류가 발생했습니다."
                : "동행 신청 중 오류가 발생했습니다."}
            </ErrorMessage>
          )}

          <ActionButton onClick={handleApply} disabled={isApplying || isMyPost}>
            {isMyPost
              ? "내 게시글"
              : isApplying
              ? "신청 중..."
              : "동행 신청하기"}
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
