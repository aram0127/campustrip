import React, { useState } from "react";
import styled from "styled-components";
import { IoArrowBack } from "react-icons/io5";
import Button from "../../components/common/Button";

const PageContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  position: relative;
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`;

const TabMenu = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
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

const UserList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const UserItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

// --- 임시 데이터 ---
const dummyFollowers = [{ id: 2, name: "김영희" }];
const dummyFollowings = [{ id: 3, name: "이철수" }];
const dummyRecommendations = [{ id: 4, name: "박민지" }];

type Tab = "followers" | "followings" | "recommendations";

function FollowListPage() {
  const [activeTab, setActiveTab] = useState<Tab>("followers");

  const renderList = () => {
    let users;
    switch (activeTab) {
      case "followings":
        users = dummyFollowings;
        break;
      case "recommendations":
        users = dummyRecommendations;
        break;
      case "followers":
      default:
        users = dummyFollowers;
        break;
    }

    return users.map((user) => (
      <UserItem key={user.id}>
        <Avatar />
        <UserInfo>
          <UserName>{user.name}</UserName>
        </UserInfo>
        <Button
          variant="outline"
          style={{ padding: "6px 16px", fontSize: "12px" }}
        >
          {activeTab === "followings" ? "언팔로우" : "팔로우"}
        </Button>
      </UserItem>
    ));
  };

  return (
    <PageContainer>
      <Header>
        <BackButton>
          <IoArrowBack />
        </BackButton>
        <Title>홍길동</Title>
      </Header>
      <TabMenu>
        <TabButton
          active={activeTab === "followers"}
          onClick={() => setActiveTab("followers")}
        >
          팔로워
        </TabButton>
        <TabButton
          active={activeTab === "followings"}
          onClick={() => setActiveTab("followings")}
        >
          팔로잉
        </TabButton>
        <TabButton
          active={activeTab === "recommendations"}
          onClick={() => setActiveTab("recommendations")}
        >
          검색
        </TabButton>
      </TabMenu>
      <UserList>{renderList()}</UserList>
    </PageContainer>
  );
}

export default FollowListPage;
