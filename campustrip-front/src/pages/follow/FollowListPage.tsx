import { useState } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

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

const UserList = styled.div``;

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
    <PageLayout title="홍길동">
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
      <ScrollingContent>
        <UserList>{renderList()}</UserList>
      </ScrollingContent>
    </PageLayout>
  );
}

export default FollowListPage;
