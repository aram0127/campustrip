import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { useQuery } from "@tanstack/react-query";
import { getMyChats } from "../../api/chats";
import { type Chat } from "../../types/chat";
import { useAuth } from "../../context/AuthContext";

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

const Avatar = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
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
        {chats.length === 0 && <Message>참여중인 채팅방이 없습니다.</Message>}
        {chats.map((chat) => (
          <ChatItem to={`/chat/${chat.id}`} key={chat.id}>
            <Avatar />
            <ChatInfo>
              <UserName>{chat.title}</UserName>
              <LastMessage>
                {/* TODO: 마지막 메시지는 Kafka/Socket으로 실시간 수신 필요 */}
                마지막 메시지...
              </LastMessage>
            </ChatInfo>
            <Timestamp>
              {/* TODO: 마지막 메시지 시간 */}
              {new Date(chat.createdAt).toLocaleDateString("ko-KR")}
            </Timestamp>
          </ChatItem>
        ))}
      </ChatList>

      <FloatingActionButton onClick={handleNewChat} />
    </PageContainer>
  );
}

export default ChatListPage;
