import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getApplicants,
  acceptApplication,
  rejectApplication,
} from "../../api/applications";
import { type Applicant } from "../../types/applicant";
import { IoArrowBack, IoCheckmark, IoClose } from "react-icons/io5";
import PageLayout from "../../components/layout/PageLayout";

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

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
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

const ActionButton = styled.button<{ variant: "accept" | "reject" }>`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  cursor: pointer;

  ${({ theme, variant }) =>
    variant === "accept" &&
    css`
      background-color: ${theme.colors.primary};
      color: white;
    `}

  ${({ theme, variant }) =>
    variant === "reject" &&
    css`
      background-color: ${theme.colors.error};
      color: white;
    `}
  
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey};
    cursor: not-allowed;
  }
`;

const StatusText = styled.span<{ status: "accepted" | "rejected" }>`
  font-size: 14px;
  font-weight: bold;
  padding: 6px 10px;
  border-radius: 6px;

  ${({ theme, status }) =>
    status === "accepted" &&
    css`
      color: ${theme.colors.primary};
      background-color: ${theme.colors.inputBackground};
    `}

  ${({ theme, status }) =>
    status === "rejected" &&
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
      title="동행 신청자 목록"
      showBackButton
      onBackClick={() => navigate(`/posts/${postId}`)}
    >
      <ApplicantList>
        {applicants.length === 0 && <Message>아직 신청자가 없습니다.</Message>}
        {applicants.map((applicant) => (
          <ApplicantItem key={applicant.id}>
            <ApplicantInfo onClick={() => handleProfileClick(applicant.id)}>
              <Avatar />
              <NameContainer>
                <ApplicantName>{applicant.name}</ApplicantName>
                <UserScore>
                  여행 온도: 🌡{applicant.userScore.toFixed(1)}
                </UserScore>
              </NameContainer>
            </ApplicantInfo>
            <ActionContainer>
              {applicant.applicationStatus === null && ( // 대기중
                <>
                  <ActionButton
                    variant="accept"
                    onClick={() => handleAccept(applicant.id)}
                    disabled={isAccepting || isRejecting}
                  >
                    <IoCheckmark />
                  </ActionButton>
                  <ActionButton
                    variant="reject"
                    onClick={() => handleReject(applicant.id)}
                    disabled={isAccepting || isRejecting}
                  >
                    <IoClose />
                  </ActionButton>
                </>
              )}
              {applicant.applicationStatus === true && ( // 수락됨
                <StatusText status="accepted">수락됨</StatusText>
              )}
              {applicant.applicationStatus === false && ( // 거절됨
                <StatusText status="rejected">거절됨</StatusText>
              )}
            </ActionContainer>
          </ApplicantItem>
        ))}
      </ApplicantList>
    </PageLayout>
  );
};

export default ApplicantListPage;
