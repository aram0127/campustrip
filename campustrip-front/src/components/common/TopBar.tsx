import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { IoNotificationsOutline } from "react-icons/io5";

const TopBarContainer = styled.header`
  display: grid;
  grid-template-columns: 50px 1fr 50px;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  height: 56px;
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
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled(Link)`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
`;

const NotificationBtn = styled.button`
  background: none;
  border: none;
  font-size: 24px;
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
  return (
    <TopBarContainer>
      <LeftSection>
        <ProfileBtn onClick={onProfileClick} />
      </LeftSection>
      <CenterSection>
        <Logo to="/">Campus Trip</Logo>
      </CenterSection>
      <RightSection>
        <NotificationBtn>
          <IoNotificationsOutline />
        </NotificationBtn>
      </RightSection>
    </TopBarContainer>
  );
};

export default TopBar;
