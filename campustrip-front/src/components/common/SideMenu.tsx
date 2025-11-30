import React from "react";
import styled from "styled-components";
import { useSpring, animated } from "react-spring";
import { useDrag } from "@use-gesture/react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { getFollowerCount, getFollowingCount } from "../../api/follow";

const Backdrop = styled(animated.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 100;
`;

const MenuContainer = styled(animated.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 101;
  display: flex;
  flex-direction: column;
  box-shadow: 4px 0px 15px rgba(0, 0, 0, 0.1);
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  box-sizing: border-box;
  touch-action: none;
`;

const MenuProfile = styled.div`
  padding: ${({ theme }) => theme.spacings.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const ProfileAvatar = styled.div<{ $imageUrl?: string }>`
  width: ${({ theme }) => theme.spacings.xxlarge};
  height: ${({ theme }) => theme.spacings.xxlarge};
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: ${({ theme }) => theme.spacings.small};
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
`;

const ProfileName = styled.div`
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.text};
`;

const ProfileId = styled.div`
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  margin-bottom: ${({ theme }) => theme.spacings.small};
`;

const FollowInfo = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacings.medium};
  font-size: ${({ theme }) => theme.fontSizes.caption};
  color: ${({ theme }) => theme.colors.text};

  span {
    cursor: pointer;
    &:hover {
      text-decoration: underline;
    }
  }
`;

const MenuList = styled.div`
  flex-grow: 1;
  padding: ${({ theme }) => theme.spacings.small}
    ${({ theme }) => theme.spacings.medium};
`;

const MenuItem = styled.div`
  padding: ${({ theme }) => theme.spacings.medium} 0;
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

const MenuFooter = styled.div`
  padding: ${({ theme }) => theme.spacings.medium};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const DarkModeToggle = styled.div`
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.title};
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
`;

interface SideMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  toggleTheme: () => void;
}

const SideMenu: React.FC<SideMenuProps> = ({
  isOpen,
  onClose,
  currentTheme,
  toggleTheme,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // 애니메이션 설정
  const [{ x }, api] = useSpring(() => ({
    x: -280,
    config: { tension: 250, friction: 25 },
  }));

  const openMenu = () => {
    api.start({ x: 0 });
  };

  const closeMenu = () => {
    api.start({ x: -280 });
    onClose();
  };

  React.useEffect(() => {
    if (isOpen) openMenu();
  }, [isOpen]);

  const bind = useDrag(({ down, movement: [mx] }) => {
    if (!down && mx < -100) closeMenu();
    else if (!down) openMenu();
    else api.start({ x: Math.min(0, mx) });
  });

  // 팔로워/팔로잉 수 데이터 연동
  const { data: followerCount = 0 } = useQuery({
    queryKey: ["followerCount", user?.id],
    queryFn: () => getFollowerCount(user!.id),
  });

  const { data: followingCount = 0 } = useQuery({
    queryKey: ["followingCount", user?.id],
    queryFn: () => getFollowingCount(user!.id),
  });

  const handleThemeToggle = () => {
    toggleTheme();
    onClose();
  };

  const handleLogout = () => {
    logout();
    onClose();
    navigate("/login");
  };

  const handleFollowClick = (type: "following" | "follower") => {
    if (user) {
      // 팔로우/팔로잉 탭 상태를 전달하며 페이지 이동
      navigate(`/profile/${user.id}/follows`, { state: { initialTab: type } });
      onClose();
    }
  };

  return (
    <>
      <Backdrop
        style={{
          opacity: x.to([-280, 0], [0, 1]),
          display: x.to((x) => (x > -280 ? "block" : "none")),
        }}
        onClick={() => closeMenu()}
      />
      <MenuContainer
        style={{ transform: x.to((x) => `translateX(${x}px)`) }}
        {...bind()}
      >
        {user ? (
          <MenuProfile>
            <ProfileAvatar $imageUrl={user.profilePhotoUrl} />{" "}
            <ProfileName>{user.name}</ProfileName>
            <ProfileId>{user.userId}</ProfileId>
            <FollowInfo>
              <span onClick={() => handleFollowClick("following")}>
                <b>{followingCount}</b> 팔로잉
              </span>
              <span onClick={() => handleFollowClick("follower")}>
                <b>{followerCount}</b> 팔로워
              </span>
            </FollowInfo>
          </MenuProfile>
        ) : (
          <MenuProfile>
            <ProfileName>로그인이 필요합니다</ProfileName>
          </MenuProfile>
        )}

        <MenuList>
          <StyledLink to={user ? `/profile/${user.id}` : "/login"}>
            <MenuItem onClick={onClose}>👤 프로필</MenuItem>
          </StyledLink>
          <StyledLink to="/settings/personal-info">
            <MenuItem onClick={onClose}>ℹ️ 개인정보</MenuItem>
          </StyledLink>
          {user && <MenuItem onClick={handleLogout}>🚪 로그아웃</MenuItem>}
        </MenuList>

        <MenuFooter>
          <DarkModeToggle onClick={handleThemeToggle}>
            {currentTheme === "light" ? "🌙" : "☀️"}
          </DarkModeToggle>
        </MenuFooter>
      </MenuContainer>
    </>
  );
};

export default SideMenu;
