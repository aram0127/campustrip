import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { useQuery } from "@tanstack/react-query";
import { getMyChats } from "../../api/chats";
import { type Chat, MessageTypeValue } from "../../types/chat";
import { useAuth } from "../../context/AuthContext";
import { useMemo } from "react";

const PageContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ChatList = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const ChatItem = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#FFFFFF" ? "#f8f9fa" : "#2c2c2e"};
  }
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
`;

const ChatInfo = styled.div`
  flex-grow: 1;
  overflow: hidden;
`;

const UserName = styled.div`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const LastMessage = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: 4px 0 0 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Timestamp = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  align-self: flex-start;
  flex-shrink: 0;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

function ChatListPage() {
  const navigate = useNavigate();
  const { user } = useAuth(); // 현재 사용자 정보

  const {
    data: chats = [],
    isLoading,
    error,
  } = useQuery<Chat[], Error>({
    queryKey: ["myChats", user?.id], // user.id를 queryKey에 포함
    queryFn: () => getMyChats(user!.id), // API 호출
    enabled: !!user, // user가 있을 때만 실행
  });

  // 최근 메시지 시간이 없으면 createdAt을 기준으로 내림차순 정렬
  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      const aTime = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : a.createdAt
        ? new Date(a.createdAt).getTime()
        : 0;
      const bTime = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : b.createdAt
        ? new Date(b.createdAt).getTime()
        : 0;
      return bTime - aTime; // 최근 순서(내림차순)
    });
  }, [chats]);

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  if (isLoading) {
    return (
      <PageContainer>
        <Message>채팅 목록을 불러오는 중...</Message>
        <FloatingActionButton onClick={handleNewChat} />
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Message>오류가 발생했습니다: {error.message}</Message>
        <FloatingActionButton onClick={handleNewChat} />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ChatList>
        {sortedChats.length === 0 && (
          <Message>참여중인 채팅방이 없습니다.</Message>
        )}
        {sortedChats.map((chat) => (
          <ChatItem to={`/chat/${chat.id}`} key={chat.id}>
            <Avatar $imageUrl={chat.profilePhotoUrl} />
            <ChatInfo>
              <UserName>{chat.title}</UserName>
              <LastMessage>
                {chat.lastMessage
                  ? chat.lastMessageType === MessageTypeValue.JOIN ||
                    chat.lastMessageType === MessageTypeValue.LEAVE
                    ? chat.lastMessage
                    : chat.senderName + ": " + chat.lastMessage
                  : "아직 메시지가 없습니다."}
              </LastMessage>
            </ChatInfo>
            <Timestamp>
              {(() => {
                const timeStr = chat.lastMessageTime || chat.createdAt;
                return timeStr
                  ? new Date(timeStr).toLocaleDateString("ko-KR")
                  : "";
              })()}
            </Timestamp>
          </ChatItem>
        ))}
      </ChatList>

      <FloatingActionButton onClick={handleNewChat} />
    </PageContainer>
  );
}

export default ChatListPage;
