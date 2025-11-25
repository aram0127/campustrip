import styled from "styled-components";
import {
  IoChatbubble,
  IoHeart,
  IoPersonAdd,
  IoTrashOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import { useNavigate } from "react-router-dom";

const NotificationList = styled.div``;

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

const HeaderActionButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  width: 44px;
  height: 44px;
`;

const RightHeaderGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: -12px; /* 패딩 조정 */
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
  const navigate = useNavigate();

  return (
    <PageLayout
      title="알림"
      headerRight={
        <RightHeaderGroup>
          <HeaderActionButton>
            <IoSettingsOutline />
          </HeaderActionButton>
          <HeaderActionButton>
            <IoTrashOutline />
          </HeaderActionButton>
        </RightHeaderGroup>
      }
      onBackClick={() => navigate("/")}
    >
      <ScrollingContent>
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
      </ScrollingContent>
    </PageLayout>
  );
}

export default NotificationListPage;
