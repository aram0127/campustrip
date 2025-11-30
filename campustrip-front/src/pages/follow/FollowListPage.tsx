import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import Button from "../../components/common/Button";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import {
  getFollowers,
  getFollowings,
  followUser,
  unfollowUser,
} from "../../api/follow";
import { getUserProfile } from "../../api/users";
import { type User } from "../../types/user";
import { useAuth } from "../../context/AuthContext";

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

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
  background-image: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl})` : "none"};
  background-size: cover;
  background-position: center;
`;

const UserInfo = styled.div`
  flex-grow: 1;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingText = styled.p`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

type Tab = "followers" | "followings" | "recommendations";

function FollowListPage() {
  const [activeTab, setActiveTab] = useState<Tab>("followers");
  const { userId: profileIdString } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followings, setFollowings] = useState<User[]>([]);
  const [currentUserFollowingIds, setCurrentUserFollowingIds] = useState<
    Set<number>
  >(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profileIdString || !currentUser) return;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const numericId = Number(profileIdString);

        if (isNaN(numericId)) {
          setError("잘못된 사용자 ID입니다.");
          setLoading(false);
          return;
        }

        const profile = await getUserProfile(numericId);
        setProfileUser(profile);

        const currentUserFollows = await getFollowings(currentUser.id);
        setCurrentUserFollowingIds(
          new Set(currentUserFollows.map((u) => u.id))
        );

        if (activeTab === "followers") {
          const data = await getFollowers(numericId);
          setFollowers(data);
        } else if (activeTab === "followings") {
          const data = await getFollowings(numericId);
          setFollowings(data);
        } else {
          // 추천 탭 예정
          setFollowers([]);
          setFollowings([]);
        }
      } catch (err) {
        console.error(err);
        setError("데이터를 불러오는 데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileIdString, activeTab, currentUser]);

  // 팔로우/언팔로우 핸들러
  const handleFollowToggle = async (targetUser: User) => {
    if (!currentUser) return;

    const currentUserId = currentUser.id;
    const targetUserId = targetUser.id;
    const isFollowing = currentUserFollowingIds.has(targetUserId);

    try {
      if (isFollowing) {
        // 언팔로우
        await unfollowUser(currentUserId, targetUserId);

        setCurrentUserFollowingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(targetUserId);
          return newSet;
        });
      } else {
        // 팔로우
        await followUser(currentUserId, targetUserId);

        setCurrentUserFollowingIds((prev) => {
          const newSet = new Set(prev);
          newSet.add(targetUserId);
          return newSet;
        });
      }

      if (
        profileUser &&
        profileUser.id === currentUserId &&
        activeTab === "followings"
      ) {
        const data = await getFollowings(currentUserId);
        setFollowings(data);
      }
    } catch (err) {
      alert("요청에 실패했습니다.");
      console.error(err);
    }
  };

  // 프로필 이동 핸들러
  const handleProfileClick = (userId: number) => {
    navigate(`/profile/${userId}`);
  };

  // 목록 렌더링
  const renderList = () => {
    if (loading) {
      return <LoadingText>불러오는 중...</LoadingText>;
    }
    if (error) {
      return <LoadingText>{error}</LoadingText>;
    }

    let users: User[] = [];
    if (activeTab === "followers") {
      users = followers;
    } else if (activeTab === "followings") {
      users = followings;
    }
    // 추천 탭 예정

    if (users.length === 0 && activeTab !== "recommendations") {
      return (
        <LoadingText>
          {activeTab === "followers" ? "팔로워" : "팔로잉"} 목록이 비어있습니다.
        </LoadingText>
      );
    }

    return users.map((user) => {
      // 현재 로그인한 유저가 이 유저를 팔로우하고 있는지 확인
      const isFollowing = currentUserFollowingIds.has(user.id);

      // 자기 자신에게는 팔로우 버튼 숨기기
      if (user.id === currentUser?.id) {
        return (
          <UserItem key={user.id}>
            <Avatar
              $imageUrl={user.profilePhotoUrl}
              onClick={() => handleProfileClick(user.id)}
            />
            <UserInfo onClick={() => handleProfileClick(user.id)}>
              <UserName>{user.name} (나)</UserName>
            </UserInfo>
          </UserItem>
        );
      }

      return (
        <UserItem key={user.id}>
          <Avatar
            $imageUrl={user.profilePhotoUrl}
            onClick={() => handleProfileClick(user.id)}
          />
          <UserInfo onClick={() => handleProfileClick(user.id)}>
            <UserName>{user.name}</UserName>
          </UserInfo>
          <Button
            $variant={isFollowing ? "outline" : "primary"}
            style={{ padding: "6px 16px", fontSize: "12px" }}
            onClick={() => handleFollowToggle(user)}
          >
            {isFollowing ? "언팔로우" : "팔로우"}
          </Button>
        </UserItem>
      );
    });
  };

  return (
    <PageLayout title={profileUser ? profileUser.name : "Follow"}>
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
