import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import axios from "axios";
import { type Post } from "../../types/post";
import { IoArrowBack } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";

// AuthContext에서 제공될 사용자 정보에 대한 타입 (AuthContext.tsx에서 실제 구현 필요)
interface UserInfo {
  id: number;
  name: string;
  userId: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  // AuthContext에서 사용자 정보를 가져옵니다. (AuthContext.tsx 수정 필요)
  const { user } = useAuth() as { user: UserInfo | null };

  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"post" | "planner">("post");

  // 동행 신청 관련 상태
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError("게시글 ID가 없습니다.");
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/posts/${postId}`);
        setPost(response.data);
      } catch (err) {
        console.error("게시글 상세 정보 로딩 실패:", err);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const handleApply = async () => {
    if (!user || !post) {
      alert("로그인 정보 또는 게시글 정보가 유효하지 않습니다.");
      return;
    }

    if (user.id === post.user.id) {
      alert("자신이 작성한 게시글에는 동행을 신청할 수 없습니다.");
      return;
    }

    setIsApplying(true);
    setApplyError(null);

    try {
      // 백엔드 Application 객체 구조에 맞춰 데이터 전송
      const applicationData = {
        post: { postId: post.postId },
        user: { userId: user.userId },
      };

      await axios.post(`${API_BASE_URL}/api/applications`, applicationData);

      alert("동행 신청이 완료되었습니다.");
      // TODO: 신청 완료 후 버튼 상태 변경 등의 UI 업데이트
    } catch (err) {
      console.error("동행 신청 실패:", err);
      let message =
        "동행 신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 500) {
          message = "이미 신청했거나 처리 중 오류가 발생했습니다.";
        } else {
          message = `신청 실패 (${err.response.status}): ${err.message}`;
        }
      }
      setApplyError(message);
      alert(message);
    } finally {
      setIsApplying(false);
    }
  };

  if (isLoading) {
    return <Message>로딩 중...</Message>;
  }

  if (error) {
    return <Message>{error}</Message>;
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

          {applyError && <ErrorMessage>{applyError}</ErrorMessage>}

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
