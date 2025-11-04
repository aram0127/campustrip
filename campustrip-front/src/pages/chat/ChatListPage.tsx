import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";

const PageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
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

// --- 임시 데이터 ---
const dummyChats = [
  {
    id: 1,
    userName: "제주도 여행",
    lastMessage: "사진 너무 잘 찍어주셔서 감사해요!",
    timestamp: "오후 2:30",
  },
  {
    id: 2,
    userName: "홍길동",
    lastMessage: "네, 그럼 그때 뵐게요!",
    timestamp: "7월 6일",
  },
  {
    id: 3,
    userName: "김철수",
    lastMessage: "혹시 일정 변경 가능할까요?",
    timestamp: "7월 3일",
  },
];

function ChatListPage() {
  const navigate = useNavigate();

  const handleNewChat = () => {
    navigate("/chat/new");
  };

  return (
    <PageContainer>
      <ChatList>
        {dummyChats.map((chat) => (
          <ChatItem to={`/chat/${chat.id}`} key={chat.id}>
            <Avatar />
            <ChatInfo>
              <UserName>{chat.userName}</UserName>
              <LastMessage>{chat.lastMessage}</LastMessage>
            </ChatInfo>
            <Timestamp>{chat.timestamp}</Timestamp>
          </ChatItem>
        ))}
      </ChatList>
      <FloatingActionButton onClick={handleNewChat} />
    </PageContainer>
  );
}

export default ChatListPage;
