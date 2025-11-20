import { useState } from "react";
import styled from "styled-components";
import { IoEllipsisHorizontal } from "react-icons/io5";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getUserProfile } from "../../api/users";
import { type User } from "../../types/user";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0;
  margin-right: -12px;
`;

const ProfileInfoContainer = styled.div`
  padding: 16px;
`;

const Avatar = styled.div`
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 12px;
`;

const UserName = styled.h1`
  font-size: 20px;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const FollowInfo = styled.div`
  display: flex;
  gap: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 5;
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 14px;
  border: none;
  background-color: transparent;
  color: ${({ theme, active }) =>
    active ? theme.colors.primary : theme.colors.secondaryTextColor};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 2px solid
    ${({ theme, active }) => (active ? theme.colors.primary : "transparent")};
`;

const ContentFeed = styled.div`
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const TempBarContainer = styled.div`
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
`;

const TempBar = styled.div<{ percentage: number }>`
  width: ${({ percentage }) => percentage}%;
  height: 100%;
  /* 0~100도를 0~100%로 매핑. 예시: 36.5도 -> 36.5% */
  background: linear-gradient(90deg, #10b981, #f59e0b, #ef4444);
`;

const TempValue = styled.p`
  text-align: right;
  font-size: 14px;
  font-weight: bold;
  color: #f59e0b;
  margin: 8px 0 0 0;
`;

const TagContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  background-color: #e0e8ff;
  color: ${({ theme }) => theme.colors.primary};
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 16px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.primary || "#0056b3"};
    opacity: 0.85;
  }
`;

// 임시 여행 성향 태그 (preference 비트마스크에 따라 파싱)
const parsePreferences = (preference: number | null) => {
  if (preference === null) return ["정보 없음"];

  const tags = [];
  if (preference & 1) tags.push("#계획적");
  if (preference & 2) tags.push("#즉흥적");
  if (preference & 4) tags.push("#맛집탐방");
  if (preference & 8) tags.push("#사진필수");
  if (preference & 16) tags.push("#뚜벅이여행");

  return tags.length > 0 ? tags : ["정보 없음"];
};

function ProfilePage() {
  const { userId } = useParams<{ userId: string }>(); // URL에서 userId 가져오기
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("여행 기록"); // 탭 상태

  // useQuery로 사용자 프로필 데이터 가져오기
  const {
    data: profileUser,
    isLoading,
    error,
  } = useQuery<User, Error>({
    queryKey: ["userProfile", userId], // key에 userId를 포함시켜 사용자별로 캐싱
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId, // userId가 있을 때만 쿼리 실행
  });

  // 로딩 및 에러 상태 처리
  if (isLoading) {
    return (
      <PageLayout title="로딩 중...">
        <Message>프로필을 불러오는 중...</Message>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout title="오류">
        <Message>오류가 발생했습니다: {error.message}</Message>
      </PageLayout>
    );
  }

  if (!profileUser) {
    return (
      <PageLayout title="오류">
        <Message>사용자 정보를 찾을 수 없습니다.</Message>
      </PageLayout>
    );
  }

  // API 데이터로 여행 성향 태그 파싱
  const travelTags = parsePreferences(profileUser.preference);

  // 사용자 온도를 0-100% 사이 값으로 변환 (100도 기준)
  const tempPercentage = Math.max(0, Math.min(100, profileUser.userScore || 0));

  // 여행 성향 검사 페이지로 이동
  const handleStartTest = () => {
    navigate(`/test/travel-test-page`);
  };

  return (
    <PageLayout
      title={profileUser.name}
      headerRight={
        <IconButton>
          <IoEllipsisHorizontal />
        </IconButton>
      }
    >
      <ScrollingContent>
        <ProfileInfoContainer>
          <Avatar />
          <UserName>{profileUser.name}</UserName>
          <FollowInfo>
            <span>
              <b>6</b> 팔로잉
            </span>
            <span>
              <b>6</b> 팔로워
            </span>
          </FollowInfo>
        </ProfileInfoContainer>

        <Section>
          <SectionTitle>여행 온도</SectionTitle>
          <TempBarContainer>
            <TempBar percentage={tempPercentage} />
          </TempBarContainer>
          <TempValue>{profileUser.userScore.toFixed(1)}°C</TempValue>
        </Section>

        <Section>
          <SectionTitle>여행 성향</SectionTitle>
          <TagContainer>
            {travelTags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagContainer>
          <ActionButton onClick={handleStartTest}>
            여행 성향 검사 시작
          </ActionButton>
        </Section>

        <TabMenu>
          <TabButton
            active={activeTab === "여행 기록"}
            onClick={() => setActiveTab("여행 기록")}
          >
            여행 기록
          </TabButton>
          <TabButton
            active={activeTab === "작성한 게시글"}
            onClick={() => setActiveTab("작성한 게시글")}
          >
            작성한 게시글
          </TabButton>
          <TabButton
            active={activeTab === "받은 후기"}
            onClick={() => setActiveTab("받은 후기")}
          >
            받은 후기
          </TabButton>
        </TabMenu>

        <ContentFeed>
          {activeTab === "여행 기록" && (
            <Message>여행 기록이 없습니다.</Message>
          )}
          {activeTab === "작성한 게시글" && (
            <Message>작성한 게시글이 없습니다.</Message>
          )}
          {activeTab === "받은 후기" && (
            <Message>받은 후기가 없습니다.</Message>
          )}
        </ContentFeed>
      </ScrollingContent>
    </PageLayout>
  );
}

export default ProfilePage;
