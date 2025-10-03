import React from 'react';
import styled from 'styled-components';
import { useSpring, animated } from 'react-spring';
import { useDrag } from '@use-gesture/react';
import { Link } from 'react-router-dom';

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
`;

const MenuProfile = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const ProfileAvatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 12px;
`;

const ProfileName = styled.div`
  font-weight: bold;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
`;

const ProfileId = styled.div`
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  font-size: 14px;
`;

const FollowInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 14px;
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const MenuList = styled.div`
  flex-grow: 1;
  padding: 10px 20px;
`;

const MenuItem = styled.div`
  padding: 15px 0;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.text};
`;

const MenuFooter = styled.div`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const DarkModeToggle = styled.div`
  cursor: pointer;
  font-size: 24px;
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

const SideMenu: React.FC<SideMenuProps> = ({ isOpen, onClose, currentTheme, toggleTheme }) => {
  const [{ x }, api] = useSpring(() => ({ x: -280, config: { tension: 250, friction: 25 } }));

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

  const handleThemeToggle = () => {
    toggleTheme();
    onClose();
  };

  return (
    <>
      <Backdrop style={{ opacity: x.to([ -280, 0 ], [ 0, 1 ]), display: x.to(x => x > -280 ? 'block' : 'none') }} onClick={() => closeMenu()} />
      <MenuContainer style={{ transform: x.to(x => `translateX(${x}px)`) }} {...bind()}>
        <MenuProfile>
            <ProfileAvatar />
            <ProfileName>홍길동</ProfileName>
            <ProfileId>@gildong_hong</ProfileId>
            <FollowInfo>
                <span><b>6</b> 팔로잉</span>
                <span><b>6</b> 팔로워</span>
            </FollowInfo>
        </MenuProfile>

        <MenuList>
          <StyledLink to="/profile">
            <MenuItem onClick={onClose}>👤 프로필</MenuItem>
          </StyledLink>
          <StyledLink to="/settings/personal-info">
            <MenuItem onClick={onClose}>ℹ️ 개인정보</MenuItem>
          </StyledLink>
        </MenuList>

        <MenuFooter>
            <DarkModeToggle onClick={handleThemeToggle}>
                {currentTheme === 'light' ? '🌙' : '☀️'}
            </DarkModeToggle>
        </MenuFooter>
      </MenuContainer>
    </>
  );
};

export default SideMenu;