import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoThumbsUp, IoThumbsDown } from "react-icons/io5";
import { type UserRate } from "../../types/user";

const ItemContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.background};
  align-items: flex-start;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RaterName = styled.span`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
`;

const Comment = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: 0;
  line-height: 1.4;
  white-space: pre-wrap;
`;

const RateIcon = styled.div<{ $isGood: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme, $isGood }) =>
    $isGood ? theme.colors.primary : theme.colors.error};
  font-size: 20px;
  padding-top: 4px;
`;

interface UserRateListItemProps {
  rate: UserRate;
}

const UserRateListItem: React.FC<UserRateListItemProps> = ({ rate }) => {
  const navigate = useNavigate();
  const isGood = rate.rate === 1;

  const handleProfileClick = () => {
    // 평가자 프로필로 이동
    navigate(`/profile/${rate.raterId}`);
  };

  return (
    <ItemContainer>
      <Avatar $imageUrl={rate.profileImageUrl} onClick={handleProfileClick} />
      <Content>
        <RaterName onClick={handleProfileClick}>{rate.raterName}</RaterName>
        <Comment>{rate.comment || "남겨진 코멘트가 없습니다."}</Comment>
      </Content>
      <RateIcon $isGood={isGood}>
        {isGood ? <IoThumbsUp /> : <IoThumbsDown />}
      </RateIcon>
    </ItemContainer>
  );
};

export default UserRateListItem;
