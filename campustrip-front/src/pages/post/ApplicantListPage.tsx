import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicants,
  acceptApplication,
  rejectApplication,
  leaveTrip,
} from "../../api/applications";
import { getPostById } from "../../api/posts";
import { type Applicant } from "../../types/applicant";
import { IoCheckmark, IoClose, IoLogOutOutline } from "react-icons/io5";
import PageLayout from "../../components/layout/PageLayout";
import { useAuth } from "../../context/AuthContext";

const ApplicantList = styled.main`
  flex-grow: 1;
  overflow-y: auto;
`;

const ApplicantItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const ApplicantInfo = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const ApplicantName = styled.span`
  font-weight: bold;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const UserScore = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;
`;

const ActionButton = styled.button<{ $variant: "accept" | "reject" }>`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  /* 수락 버튼 */
  ${({ theme, $variant }) =>
    $variant === "accept" &&
    css`
      background-color: ${theme.colors.primary};
      color: white;
    `}

  /* 거절 버튼 */
  ${({ theme, $variant }) =>
    $variant === "reject" &&
    css`
      background-color: ${theme.colors.inputBackground};
      color: ${theme.colors.text};
    `}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active {
    opacity: 0.8;
  }
`;

const StatusText = styled.span<{ $status: "accepted" | "rejected" }>`
  font-size: 14px;
  font-weight: bold;
  padding: 6px 10px;
  border-radius: 6px;

  ${({ theme, $status }) =>
    $status === "accepted" &&
    css`
      color: ${theme.colors.primary};
      background-color: ${theme.colors.inputBackground};
    `}

  ${({ theme, $status }) =>
    $status === "rejected" &&
    css`
      color: ${theme.colors.error};
      background-color: ${theme.colors.inputBackground};
    `}
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ApplicantListPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: post } = useQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostById(postId!),
    enabled: !!postId,
  });

  const isAuthor = user?.id === post?.user.id;

  // 신청자 목록 조회
  const {
    data: applicants = [],
    isLoading,
    error,
  } = useQuery<Applicant[], Error>({
    queryKey: ["applicants", postId],
    queryFn: () => getApplicants(postId!),
    enabled: !!postId,
  });

  // 신청 수락
  const { mutate: acceptMutate, isPending: isAccepting } = useMutation({
    mutationFn: acceptApplication,
    onSuccess: () => {
      alert("신청을 수락했습니다.");
      // 목록을 새로고침
      queryClient.invalidateQueries({ queryKey: ["applicants", postId] });
    },
    onError: (err) => {
      alert(`수락 처리 중 오류 발생: ${err.message}`);
    },
  });

  // 신청 거절
  const { mutate: rejectMutate, isPending: isRejecting } = useMutation({
    mutationFn: rejectApplication,
    onSuccess: () => {
      alert("신청을 거절했습니다.");
      queryClient.invalidateQueries({ queryKey: ["applicants", postId] });
    },
    onError: (err) => {
      alert(`거절 처리 중 오류 발생: ${err.message}`);
    },
  });

  // 동행 나가기
  const { mutate: leaveMutate, isPending: isLeaving } = useMutation({
    mutationFn: leaveTrip,
    onSuccess: () => {
      alert("동행에서 나갔습니다.");
      queryClient.invalidateQueries({ queryKey: ["post", postId] }); // 게시글 상태 갱신
      navigate(`/posts/${postId}`); // 게시글 상세로 이동
    },
    onError: (err) => {
      alert(`나가기 처리 중 오류 발생: ${err.message}`);
    },
  });

  const handleLeave = () => {
    if (window.confirm("정말로 이 동행에서 나가시겠습니까?")) {
      leaveMutate(Number(postId));
    }
  };

  const handleAccept = (applicantId: number) => {
    if (isAccepting || isRejecting) return;
    acceptMutate({ postId: Number(postId), userId: applicantId });
  };

  const handleReject = (applicantId: number) => {
    if (isAccepting || isRejecting) return;
    rejectMutate({ postId: Number(postId), userId: applicantId });
  };

  const handleProfileClick = (applicantId: number) => {
    // 백엔드 DTO의 id필드(membership_id)를 프로필 ID로 사용
    navigate(`/profile/${applicantId}`);
  };

  if (isLoading) {
    return <Message>신청자 목록을 불러오는 중...</Message>;
  }

  if (error) {
    return <Message>오류가 발생했습니다: {error.message}</Message>;
  }

  return (
    <PageLayout
      title={isAuthor ? "동행 신청자 목록" : "참여자 목록"}
      showBackButton
      onBackClick={() => navigate(-1)}
    >
      <ApplicantList>
        {applicants.length === 0 && <Message>아직 신청자가 없습니다.</Message>}
        {applicants.map((applicant) => (
          <ApplicantItem key={applicant.id}>
            <ApplicantInfo onClick={() => handleProfileClick(applicant.id)}>
              <Avatar $imageUrl={applicant.profilePhotoUrl} />
              <NameContainer>
                <ApplicantName>
                  {applicant.name}
                  {user?.id === applicant.id && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "#007AFF",
                        marginLeft: "4px",
                      }}
                    >
                      (나)
                    </span>
                  )}
                </ApplicantName>
                <UserScore>
                  여행 온도: 🌡{applicant.userScore.toFixed(1)}
                </UserScore>
              </NameContainer>
            </ApplicantInfo>

            <ActionContainer>
              {/* 작성자인 경우 관리 기능 표시 */}
              {isAuthor && (
                <>
                  {applicant.applicationStatus === null && (
                    <>
                      <ActionButton
                        $variant="accept"
                        onClick={() => handleAccept(applicant.id)}
                        disabled={isAccepting || isRejecting}
                      >
                        <IoCheckmark />
                      </ActionButton>
                      <ActionButton
                        $variant="reject"
                        onClick={() => handleReject(applicant.id)}
                        disabled={isAccepting || isRejecting}
                      >
                        <IoClose />
                      </ActionButton>
                    </>
                  )}
                  {applicant.applicationStatus === true && (
                    <StatusText $status="accepted">수락됨</StatusText>
                  )}
                  {applicant.applicationStatus === false && (
                    <StatusText $status="rejected">거절됨</StatusText>
                  )}
                </>
              )}

              {/* 참여자인 경우 수락된 상태라면 '나가기' 버튼 표시 */}
              {!isAuthor &&
                user?.id === applicant.id &&
                applicant.applicationStatus === true && (
                  <ActionButton
                    $variant="reject"
                    onClick={handleLeave}
                    disabled={isLeaving}
                    title="동행 나가기"
                  >
                    <IoLogOutOutline /> 나가기
                  </ActionButton>
                )}

              {/* 다른 참여자거나 상태 표시만 필요한 경우 */}
              {!isAuthor &&
                user?.id !== applicant.id &&
                (applicant.applicationStatus === true ? (
                  <StatusText $status="accepted">참여중</StatusText>
                ) : null)}
            </ActionContainer>
          </ApplicantItem>
        ))}
      </ApplicantList>
    </PageLayout>
  );
};

export default ApplicantListPage;
