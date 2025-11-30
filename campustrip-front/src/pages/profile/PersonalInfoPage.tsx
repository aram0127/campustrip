import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoChevronForward } from "react-icons/io5";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../api/users";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

const Section = styled.section`
  margin-bottom: 32px;
  padding: 0 20px;
`;

const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 12px;
`;

const InfoGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const Label = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const Value = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionList = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  margin-top: 24px;
`;

const ActionItem = styled.button<{ $isDestructive?: boolean }>`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background-color: ${({ theme }) => theme.colors.background};
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  cursor: pointer;
  font-size: 16px;
  color: ${({ theme, $isDestructive }) =>
    $isDestructive ? theme.colors.error : theme.colors.text};
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.grey};
  font-size: 20px;
  display: flex;
  align-items: center;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 40px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const PersonalInfoPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  // 최신 유저 정보를 서버에서 가져옴
  const { data: user, isLoading } = useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: () => getUserProfile(authUser!.id),
    enabled: !!authUser,
  });

  const handleDeleteAccount = () => {
    // 회원탈퇴 페이지로 이동
    navigate("/profile/delete-account");
  };

  const handlePasswordChange = () => {
    // 비밀번호 변경 페이지로 이동
    alert("비밀번호 변경 페이지로 이동");
  };

  if (isLoading) {
    return (
      <PageLayout title="개인정보 관리">
        <LoadingMessage>정보를 불러오는 중...</LoadingMessage>
      </PageLayout>
    );
  }

  if (!user) {
    return (
      <PageLayout title="개인정보 관리">
        <LoadingMessage>사용자 정보를 찾을 수 없습니다.</LoadingMessage>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="개인정보 관리" onBackClick={() => navigate(-1)}>
      <ScrollingContent style={{ padding: "24px 0" }}>
        {/* 학교 정보 */}
        <Section>
          <SectionTitle>학교 정보</SectionTitle>
          <InfoGroup>
            <InfoRow>
              <Label>학교 이메일</Label>
              <Value>{user.schoolEmail}</Value>
            </InfoRow>
            <InfoRow>
              <Label>학교</Label>
              <Value>{user.university}</Value>
            </InfoRow>
          </InfoGroup>
        </Section>

        {/* 개인 프로필 정보 */}
        <Section>
          <SectionTitle>개인 프로필 정보</SectionTitle>
          <InfoGroup>
            <InfoRow>
              <Label>이름</Label>
              <Value>{user.name}</Value>
            </InfoRow>
            <InfoRow>
              <Label>휴대폰 번호</Label>
              <Value>{user.phoneNumber || "정보 없음"}</Value>
            </InfoRow>
            <InfoRow>
              <Label>성별</Label>
              <Value>{user.gender || "정보 없음"}</Value>
            </InfoRow>
          </InfoGroup>
        </Section>

        {/* 액션 버튼들 */}
        <ActionList>
          <ActionItem
            onClick={() => alert("개인 프로필 정보 수정 페이지로 이동")}
          >
            개인정보 수정
            <IconWrapper>
              <IoChevronForward />
            </IconWrapper>
          </ActionItem>

          <ActionItem onClick={handlePasswordChange}>
            비밀번호 변경
            <IconWrapper>
              <IoChevronForward />
            </IconWrapper>
          </ActionItem>

          <ActionItem onClick={handleDeleteAccount} $isDestructive>
            회원 탈퇴
            <IconWrapper>
              <IoChevronForward />
            </IconWrapper>
          </ActionItem>
        </ActionList>
      </ScrollingContent>
    </PageLayout>
  );
};

export default PersonalInfoPage;
