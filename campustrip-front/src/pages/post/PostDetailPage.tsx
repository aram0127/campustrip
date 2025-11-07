import React, { useState, useMemo, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPostById, deletePost } from "../../api/posts";
import { createApplication, cancelApplication } from "../../api/applications";
import { type Post } from "../../types/post";
import { type Application } from "../../types/application";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { useAuth } from "../../context/AuthContext";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";

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

const ScrollingBody = styled.div`
  flex-grow: 1;
  overflow-y: auto;
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

const HeaderMenuButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  margin-left: auto;
  position: relative;
  width: 44px;
  height: 44px;
  justify-content: flex-end;
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 110%; /* 버튼 바로 아래 */
  right: 0;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
  width: 120px;
`;

const DropdownItem = styled.button<{ isDelete?: boolean }>`
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme, isDelete }) =>
    isDelete ? theme.colors.error : theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
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

type ButtonProps = {
  text: string;
  variant: "primary" | "danger";
  disabled: boolean;
};

const PostDetailPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<"post" | "planner">("post");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLButtonElement>(null);

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
        applicationId: null,
      };
    }
    // 'false' (거절) 상태
    if (currentUserApplication.applicationStatus === false) {
      return {
        applicationStatus: "REJECTED" as ApplicationStatus,
        applicationId: null,
      };
    }
    // 'null' (대기중)
    return {
      applicationStatus: "PENDING" as ApplicationStatus,
      applicationId: null,
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

  // 삭제를 위한 useMutation
  const { mutate: performDelete, isPending: isDeleting } = useMutation<
    void,
    Error,
    string // postId (string)를 받음
  >({
    mutationFn: deletePost,
    onSuccess: () => {
      alert("게시글이 삭제되었습니다.");
      // 포스트 목록 캐시를 무효화하여 목록 페이지가 새로고침되도록 함
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      // 목록 페이지로 이동
      navigate("/posts", { replace: true });
    },
    onError: (err) => {
      console.error("삭제 실패:", err);
      alert(`삭제에 실패했습니다: ${err.message}`);
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // 메뉴가 열려있고, 클릭된 영역이 메뉴 버튼(ref)의 바깥쪽일 때
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    // 이벤트 리스너 등록
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // 컴포넌트 언마운트 시 리스너 제거
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]); // ref가 변경될 때만 effect 재실행

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

  const handleEditClick = () => {
    // TODO: 게시글 수정 페이지로 이동 (PostCreateFlow 재사용 또는 수정용 페이지 신규 생성)
    alert("게시글 수정 기능은 준비 중입니다.");
    setIsMenuOpen(false);
    // 예: navigate(`/posts/edit/${postId}`);
  };

  const handleDeleteClick = () => {
    setIsMenuOpen(false);
    if (isDeleting) return; // 중복 삭제 방지

    if (window.confirm("정말로 이 게시글을 삭제하시겠습니까?")) {
      performDelete(postId!);
    }
  };

  if (isLoading) {
    return (
      <PageLayout title="로딩 중...">
        <Message>로딩 중...</Message>
      </PageLayout>
    );
  }

  if (queryError) {
    return (
      <PageLayout title="오류">
        <Message>{queryError.message}</Message>
      </PageLayout>
    );
  }

  if (!post) {
    return (
      <PageLayout title="오류">
        <Message>게시글 정보를 찾을 수 없습니다.</Message>
      </PageLayout>
    );
  }

  const isMyPost = user?.id === post.user.id;
  const isMutationLoading = isApplying || isCanceling || isDeleting;

  // 버튼 텍스트와 스타일 상태 결정
  const getButtonProps = (): ButtonProps => {
    if (isMyPost) {
      return {
        text: "동행 신청자 목록",
        variant: "primary",
        disabled: false,
      };
    }
    if (isMutationLoading) {
      return {
        text: "처리 중...",
        variant: "primary",
        disabled: true,
      };
    }

    switch (applicationStatus) {
      case "ACCEPTED":
        return {
          text: "신청 됨",
          variant: "primary",
          disabled: true,
        };
      case "REJECTED":
        return {
          text: "거절됨",
          variant: "primary",
          disabled: true,
        };
      case "PENDING":
        return {
          text: "신청 취소",
          variant: "danger",
          disabled: false,
        };
      case "NOT_APPLIED":
      default:
        return {
          text: "동행 신청하기",
          variant: "primary",
          disabled: false,
        };
    }
  };

  const buttonProps = getButtonProps();

  return (
    <PageLayout
      title="게시글"
      headerRight={
        isMyPost ? (
          <HeaderMenuButton
            ref={menuRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <IoEllipsisHorizontal />
            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem onClick={handleEditClick}>수정</DropdownItem>
                <DropdownItem onClick={handleDeleteClick} isDelete>
                  {isDeleting ? "삭제 중..." : "삭제"}
                </DropdownItem>
              </DropdownMenu>
            )}
          </HeaderMenuButton>
        ) : null
      }
    >
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

      {/* 스크롤 영역 */}
      <ScrollingBody>
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
                  {post.regions?.map((r) => r.name).join(", ") || "정보 없음"}
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

            {(applyError || cancelError) && (
              <ErrorMessage>신청 처리 중 오류가 발생했습니다.</ErrorMessage>
            )}

            <Button
              onClick={handleButtonClick}
              variant={buttonProps.variant}
              disabled={buttonProps.disabled || isDeleting}
              size="large"
              style={{ width: "100%" }}
            >
              {isDeleting ? "삭제 중..." : buttonProps.text}
            </Button>
          </ContentContainer>
        )}

        {activeTab === "planner" && (
          <ContentContainer>
            <p>플래너 기능은 준비 중</p>
          </ContentContainer>
        )}
      </ScrollingBody>
    </PageLayout>
  );
};

export default PostDetailPage;
