import React from "react";
import styled from "styled-components";
import {
  IoArrowBack,
  IoChatbubble,
  IoHeart,
  IoPersonAdd,
  IoTrashOutline,
  IoSettingsOutline,
} from "react-icons/io5";

const PageContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const NotificationList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const NotificationItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const IconWrapper = styled.div<{ type: "message" | "like" | "follow" }>`
  font-size: 24px;
  color: ${({ theme, type }) => {
    if (type === "like") return theme.colors.error;
    if (type === "follow") return theme.colors.primary;
    return theme.colors.secondaryTextColor;
  }};
  flex-shrink: 0;
`;

const NotificationContent = styled.div`
  flex-grow: 1;
`;

const NotificationText = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const Timestamp = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 30px;
  height: 30px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: end;
`;

const Header = styled.header`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  padding: 0 16px;
  flex-shrink: 0;
  height: 56px;
  box-sizing: border-box;
  background-color: ${({ theme }) =>
    theme.colors.background === "#FFFFFF" ? "#f8f9fa" : "#2c2c2e"};
  color: ${({ theme }) => theme.colors.text};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const HeaderSection = styled.div`
  display: flex;
  align-items: center;
`;

const LeftSection = styled(HeaderSection)`
  justify-content: flex-start;
`;

const CenterSection = styled(HeaderSection)`
  justify-content: center;
`;

const RightSection = styled(HeaderSection)`
  justify-content: flex-end;
  gap: 16px;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 30px;
  height: 30px;
`;

// --- 임시 데이터 ---
const dummyNotifications = [
  {
    id: 1,
    type: "message",
    text: "새로운 메세지가 있습니다.",
    from: "사용자 3",
    time: "2025/09/11 14:30",
  },
  {
    id: 2,
    type: "like",
    text: "회원님의 후기 게시글을 좋아합니다.",
    from: "사용자 7",
    time: "2025/09/11 09:00",
  },
  {
    id: 3,
    type: "follow",
    text: "회원님을 팔로우하기 시작했습니다.",
    from: "사용자 8",
    time: "2025/09/11 09:00",
  },
  {
    id: 4,
    type: "chat",
    text: '"○○ 여행" 채팅방에 참여하였습니다.',
    from: "사용자 2",
    time: "2025/09/10 22:00",
  },
];

const getIcon = (type: string) => {
  switch (type) {
    case "like":
      return <IoHeart />;
    case "follow":
      return <IoPersonAdd />;
    case "message":
    case "chat":
    default:
      return <IoChatbubble />;
  }
};

function NotificationListPage() {
  return (
    <PageContainer>
      <Header>
        <LeftSection>
          <ActionButton>
            <IoArrowBack />
          </ActionButton>
        </LeftSection>
        <CenterSection>
          <Title>알림</Title>
        </CenterSection>
        <RightSection>
          <ActionButton>
            <IoSettingsOutline />
          </ActionButton>
          <ActionButton>
            <IoTrashOutline />
          </ActionButton>
        </RightSection>
      </Header>
      <NotificationList>
        {dummyNotifications.map((noti) => (
          <NotificationItem key={noti.id}>
            <IconWrapper type={noti.type as any}>
              {getIcon(noti.type)}
            </IconWrapper>
            <NotificationContent>
              <NotificationText>
                <b>{noti.from}</b>님이 {noti.text}
              </NotificationText>
              <Timestamp>{noti.time}</Timestamp>
            </NotificationContent>
          </NotificationItem>
        ))}
      </NotificationList>
    </PageContainer>
  );
}

export default NotificationListPage;
