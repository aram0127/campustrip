import styled from "styled-components";
import { NavLink } from "react-router-dom";

const NavContainer = styled.nav`
  display: flex;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  background-color: ${({ theme }) => theme.colors.background};
  padding-bottom: env(safe-area-inset-bottom);
`;

const NavButton = styled(NavLink)`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.xsmall} 0;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.secondaryTextColor};

  &.active {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const NavIcon = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.title};
`;

const NavText = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.caption};
`;

const BottomNav = () => {
  return (
    <NavContainer>
      <NavButton to="/posts">
        <NavIcon>📝</NavIcon>
        <NavText>모집게시글</NavText>
      </NavButton>
      <NavButton to="/reviews">
        <NavIcon>👍</NavIcon>
        <NavText>후기게시글</NavText>
      </NavButton>
      <NavButton to="/planner">
        <NavIcon>🗺️</NavIcon>
        <NavText>여행플래너</NavText>
      </NavButton>
      <NavButton to="/chat">
        <NavIcon>💬</NavIcon>
        <NavText>채팅</NavText>
      </NavButton>
    </NavContainer>
  );
};

export default BottomNav;
