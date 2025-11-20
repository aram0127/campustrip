import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";

const TopBarContainer = styled.header`
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.small}
    ${({ theme }) => theme.spacings.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  height: 64px;
  box-sizing: border-box;
`;

const LeftSection = styled.div`
  display: flex;
  justify-content: flex-start;
`;

const CenterSection = styled.div`
  display: flex;
  justify-content: center;
`;

const RightSection = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const ProfileBtn = styled.button`
  width: 44px;
  height: 44px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.fontSizes.subtitle};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const NotificationBtn = styled.button`
  background: none;
  border: none;
  font-size: ${({ theme }) => theme.fontSizes.title};
  width: 44px;
  height: 44px;
  padding: 0;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface TopBarProps {
  onProfileClick: () => void;
}

const TopBar: React.FC<TopBarProps> = ({ onProfileClick }) => {
  const navigate = useNavigate();

  return (
    <TopBarContainer>
      <LeftSection>
        <ProfileBtn onClick={onProfileClick} />
      </LeftSection>
      <CenterSection>
        <Logo to="/">Campus Trip</Logo>
      </CenterSection>
      <RightSection>
        <NotificationBtn onClick={() => navigate("/notifications")}>
          <IoNotificationsOutline />
        </NotificationBtn>
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;
