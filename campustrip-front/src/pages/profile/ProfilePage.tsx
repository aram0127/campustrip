import React from 'react';
import styled from 'styled-components';
import { IoArrowBack, IoEllipsisHorizontal } from 'react-icons/io5';

const PageContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 10;
`;

const HeaderText = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
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
  top: 50px;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 5;
`;

const TabButton = styled.button<{ active?: boolean }>`
  flex: 1;
  padding: 14px;
  border: none;
  background-color: transparent;
  color: ${({ theme, active }) => (active ? theme.colors.primary : theme.colors.secondaryTextColor)};
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-bottom: 2px solid ${({ theme, active }) => (active ? theme.colors.primary : 'transparent')};
`;

const ContentFeed = styled.div`
  min-height: 100vh;
`;

const Section = styled.section`
  padding: 16px 0;
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

function ProfilePage() {
  return (
    <PageContainer>
      <Header>
        <IconButton><IoArrowBack /></IconButton>
        <HeaderText>홍길동</HeaderText>
        <IconButton><IoEllipsisHorizontal /></IconButton>
      </Header>

      <ProfileInfoContainer>
        <Avatar />
        <UserName>홍길동</UserName>
        <FollowInfo>
          <span><b>6</b> 팔로잉</span>
          <span><b>6</b> 팔로워</span>
        </FollowInfo>
      </ProfileInfoContainer>

      <Section>
        <SectionTitle>여행 온도</SectionTitle>
        <TempBarContainer>
        <TempBar percentage={75} />
        </TempBarContainer>
        <TempValue>75°C</TempValue>
      </Section>

      <Section>
        <SectionTitle>여행 성향</SectionTitle>
        <TagContainer>
        <Tag>#계획적</Tag>
        <Tag>#맛집탐방</Tag>
        <Tag>#사진필수</Tag>
        <Tag>#뚜벅이여행</Tag>
        </TagContainer>
      </Section>

      <TabMenu>
        <TabButton active>여행 기록</TabButton>
        <TabButton>작성한 게시글</TabButton>
        <TabButton>받은 후기</TabButton>
      </TabMenu>

      <ContentFeed>
        {/* 여기에 사용자가 작성한 게시물 목록이 표시 */}
      </ContentFeed>
    </PageContainer>
  );
}

export default ProfilePage;