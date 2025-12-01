import { useState } from "react";
import styled from "styled-components";
import {
  IoChatbubble,
  IoPersonAdd,
  IoTrashOutline,
  IoCheckmarkCircle,
  IoNotifications,
  IoCloseCircle,
  IoStar,
  IoChatboxEllipses,
  IoCheckbox,
  IoSquareOutline,
  IoClose,
} from "react-icons/io5";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  getUserNotifications,
  deleteNotification,
} from "../../api/notifications";
import {
  type NotificationType,
  type PushNotification,
} from "../../types/notification";
import Button from "../../components/common/Button";

const NotificationList = styled.div``;

const NotificationItem = styled.div<{ $isSelected?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme, $isSelected }) =>
    $isSelected ? theme.colors.inputBackground : theme.colors.background};
  transition: background-color 0.2s;
  cursor: pointer;

  &:active {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const CheckboxWrapper = styled.div`
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
`;

const IconWrapper = styled.div<{ $type: NotificationType | string }>`
  font-size: 24px;
  color: ${({ theme, $type }) => {
    if ($type === "FOLLOW") return theme.colors.primary;
    if ($type === "APPLICATION_ACCEPT") return theme.colors.secondary;
    if ($type === "APLLICATION_REQUEST") return "#FF9500";
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
  gap: 4px;
  margin-right: -8px;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const SelectAllButton = styled.button`
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  background: none;
  border: none;
  cursor: pointer;
  margin-right: 8px;
  white-space: nowrap;
`;

const BottomActionContainer = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.background};
`;

const getIcon = (type: string) => {
  switch (type) {
    case "FOLLOW":
      return <IoPersonAdd />;
    case "APLLICATION_REQUEST":
      return <IoChatbubble />;
    case "APPLICATION_ACCEPT":
      return <IoCheckmarkCircle />;
    case "APPLICATION_REJECT":
      return <IoCloseCircle />;
    case "USER_RATED":
      return <IoStar />;
    case "REVIEW_COMMENT":
      return <IoChatboxEllipses />;
    default:
      return <IoNotifications />;
  }
};

const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

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
  const queryClient = useQueryClient();

  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // 알림 목록 쿼리
  const {
    data: notifications = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: () => getUserNotifications(user!.id),
    enabled: !!user,
    refetchOnWindowFocus: true,
  });

  // 삭제 Mutation
  const deleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      await Promise.all(ids.map((id) => deleteNotification(id)));
    },
    onSuccess: () => {
      alert("삭제되었습니다.");
      queryClient.invalidateQueries({ queryKey: ["notifications", user?.id] });
      setIsDeleteMode(false);
      setSelectedIds(new Set());
    },
    onError: (err) => {
      console.error("Error deleting notifications:", err);
      alert("삭제 중 오류가 발생했습니다.");
    },
  });

  // 삭제 모드 토글
  const toggleDeleteMode = () => {
    if (isDeleteMode) {
      setIsDeleteMode(false);
      setSelectedIds(new Set());
    } else {
      setIsDeleteMode(true);
    }
  };

  // 개별 선택 토글
  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  // 전체 선택/해제 핸들러
  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length && notifications.length > 0) {
      setSelectedIds(new Set());
    } else {
      const allIds = new Set(notifications.map((n) => n.id));
      setSelectedIds(allIds);
    }
  };

  // 선택 삭제 실행
  const handleDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (window.confirm(`${selectedIds.size}개의 알림을 삭제하시겠습니까?`)) {
      deleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleItemClick = (noti: PushNotification) => {
    if (isDeleteMode) {
      handleToggleSelect(noti.id);
      return;
    }

    if (
      noti.type === "APLLICATION_REQUEST" ||
      noti.type === "APPLICATION_ACCEPT" ||
      noti.type === "APPLICATION_REJECT"
    ) {
      navigate(`/posts/${noti.referenceId}`);
    } else if (noti.type === "FOLLOW") {
      navigate(`/profile/${noti.senderId}`);
    } else if (noti.type === "REVIEW_COMMENT") {
      navigate(`/reviews/${noti.referenceId}`);
    } else if (noti.type === "USER_RATED") {
      navigate(`/profile/${user?.id}`);
    }
  };

  const renderHeaderRight = () => {
    if (isDeleteMode) {
      // 전체 선택 여부 확인
      const isAllSelected =
        selectedIds.size === notifications.length && notifications.length > 0;

      return (
        <RightHeaderGroup>
          <SelectAllButton onClick={handleSelectAll}>
            {isAllSelected ? "전체 해제" : "전체 선택"}
          </SelectAllButton>
          <HeaderActionButton onClick={toggleDeleteMode}>
            <IoClose size={24} />
          </HeaderActionButton>
        </RightHeaderGroup>
      );
    }

    return (
      <RightHeaderGroup>
        <HeaderActionButton onClick={toggleDeleteMode}>
          <IoTrashOutline />
        </HeaderActionButton>
      </RightHeaderGroup>
    );
  };

  return (
    <PageLayout
      title={isDeleteMode ? `알림 선택 (${selectedIds.size})` : "알림"}
      headerRight={renderHeaderRight()}
      onBackClick={() => {
        if (isDeleteMode) toggleDeleteMode();
        else navigate(-1);
      }}
      showBackButton={true}
    >
      <ScrollingContent>
        {isLoading && <Message>알림을 불러오는 중...</Message>}

        {!isLoading && !error && notifications.length === 0 && (
          <Message>새로운 알림이 없습니다.</Message>
        )}

        <NotificationList>
          {notifications.map((noti) => {
            const isSelected = selectedIds.has(noti.id);

            return (
              <NotificationItem
                key={noti.id}
                onClick={() => handleItemClick(noti)}
                $isSelected={isSelected}
              >
                {isDeleteMode && (
                  <CheckboxWrapper>
                    {isSelected ? <IoCheckbox /> : <IoSquareOutline />}
                  </CheckboxWrapper>
                )}

                <IconWrapper $type={noti.type}>
                  {getIcon(noti.type)}
                </IconWrapper>

                <NotificationContent>
                  <NotificationTitle>{noti.title}</NotificationTitle>
                  <NotificationBody>{noti.body}</NotificationBody>
                  <Timestamp>{formatTime(noti.createdAt)}</Timestamp>
                </NotificationContent>
              </NotificationItem>
            );
          })}
        </NotificationList>
      </ScrollingContent>

      {isDeleteMode && (
        <BottomActionContainer>
          <Button
            $variant="danger"
            $size="large"
            style={{ width: "100%" }}
            disabled={selectedIds.size === 0 || deleteMutation.isPending}
            onClick={handleDeleteSelected}
          >
            {deleteMutation.isPending ? "삭제 중..." : "선택 삭제"}
          </Button>
        </BottomActionContainer>
      )}
    </PageLayout>
  );
}

export default NotificationListPage;
