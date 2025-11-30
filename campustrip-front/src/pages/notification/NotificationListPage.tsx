import styled from "styled-components";
import {
  IoChatbubble,
  IoPersonAdd,
  IoTrashOutline,
  IoSettingsOutline,
  IoCheckmarkCircle,
  IoNotifications,
} from "react-icons/io5";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import { getUserNotifications } from "../../api/notifications";
import { type NotificationType } from "../../types/notification";

const NotificationList = styled.div``;

const NotificationItem = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.background};
  transition: background-color 0.2s;

  &:active {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const IconWrapper = styled.div<{ $type: NotificationType | string }>`
  font-size: 24px;
  color: ${({ theme, $type }) => {
    if ($type === "FOLLOW") return theme.colors.primary; // 팔로우는 파란색/초록색
    if ($type === "APPLICATION_ACCEPT") return theme.colors.secondary; // 수락은 성공색
    if ($type === "APLLICATION_REQUEST") return "#FF9500"; // 신청은 주황색
    return theme.colors.secondaryTextColor;
  }};
  flex-shrink: 0;
  margin-top: 2px;
`;

const NotificationContent = styled.div`
  flex-grow: 1;
`;

const NotificationTitle = styled.p`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const NotificationBody = styled.p`
  margin: 0 0 6px 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
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
  margin-right: -12px;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

// 타입에 따른 아이콘 반환
const getIcon = (type: string) => {
  switch (type) {
    case "FOLLOW":
      return <IoPersonAdd />;
    case "APLLICATION_REQUEST":
      return <IoChatbubble />;
    case "APPLICATION_ACCEPT":
      return <IoCheckmarkCircle />;
    default:
      return <IoNotifications />;
  }
};

// 날짜 포맷팅 함수
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  // 24시간 이내면 시간만 표시, 그 외엔 날짜 표시
  if (diff < 1000 * 60 * 60 * 24) {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" });
};

function NotificationListPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // 알림 목록 쿼리
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getUserNotifications(user!.id),
    enabled: !!user, // 유저 정보가 있을 때만 실행
    refetchOnWindowFocus: true, // 알림 페이지 돌아올 때 갱신
  });

  // 알림 클릭 핸들러
  const handleNotificationClick = (noti: any) => {
    // referenceId를 활용해 해당 페이지로 이동
    if (
      noti.type === "APLLICATION_REQUEST" ||
      noti.type === "APPLICATION_ACCEPT"
    ) {
      // 게시글 상세 혹은 신청자 목록으로 이동
      navigate(`/posts/${noti.referenceId}`);
    } else if (noti.type === "FOLLOW") {
      // 팔로워 프로필로 이동 (senderId가 보낸 사람)
      navigate(`/profile/${noti.senderId}`);
    }
  };

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
      onBackClick={() => navigate(-1)}
    >
      <ScrollingContent>
        {isLoading && <Message>알림을 불러오는 중...</Message>}

        {!isLoading && !error && notifications.length === 0 && (
          <Message>새로운 알림이 없습니다.</Message>
        )}

        <NotificationList>
          {notifications.map((noti) => (
            <NotificationItem
              key={`${noti.receiverId}-${noti.createdAt}`}
              onClick={() => handleNotificationClick(noti)}
              style={{ cursor: "pointer" }}
            >
              <IconWrapper $type={noti.type}>{getIcon(noti.type)}</IconWrapper>
              <NotificationContent>
                <NotificationTitle>{noti.title}</NotificationTitle>
                <NotificationBody>{noti.body}</NotificationBody>
                <Timestamp>{formatTime(noti.createdAt)}</Timestamp>
              </NotificationContent>
            </NotificationItem>
          ))}
        </NotificationList>
      </ScrollingContent>
    </PageLayout>
  );
}

export default NotificationListPage;
