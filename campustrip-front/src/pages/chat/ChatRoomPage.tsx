import React from 'react';
import styled from 'styled-components';
import { IoArrowBack, IoMenu, IoAdd, IoSend } from 'react-icons/io5';

const PageContainer = styled.div`
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const MessageList = styled.div`
  flex-grow: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
`;

const MessageBubble = styled.div<{ isMe?: boolean }>`
  max-width: 70%;
  padding: 10px 14px;
  border-radius: 18px;
  margin-bottom: 4px;
  align-self: ${({ isMe }) => (isMe ? 'flex-end' : 'flex-start')};
  background-color: ${({ isMe, theme }) => (isMe ? theme.colors.primary : theme.colors.inputBackground)};
  color: ${({ isMe, theme }) => (isMe ? 'white' : theme.colors.text)};
`;

const Timestamp = styled.span<{ isMe?: boolean }>`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 12px;
  align-self: ${({ isMe }) => (isMe ? 'flex-end' : 'flex-start')};
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const MessageInput = styled.input`
  flex-grow: 1;
  border: none;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  padding: 10px 14px;
  border-radius: 20px;
  margin: 0 8px;
  &:focus {
    outline: none;
  }
`;

const MessageContainer = styled.div<{ isMe?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${({ isMe }) => (isMe ? 'flex-end' : 'flex-start')};
  margin-bottom: 12px;
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Avatar = styled.div`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const UserName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const BubbleContainer = styled.div<{ isMe?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  align-self: ${({ isMe }) => (isMe ? 'flex-end' : 'flex-start')};
`;

const SendButton = styled(HeaderButton)`
  color: ${({ theme }) => theme.colors.primary};
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  font-size: 12px;
`;

// --- 임시 데이터 ---
const dummyMessages = [
  { id: 1, user: '사용자 3', text: '안녕하세요, 동행 신청합니다!', date: '2025년 9월 29일', time: '오후 2:30', isMe: false },
  { id: 2, user: '나', text: '네, 안녕하세요!', date: '2025년 9월 29일', time: '오후 2:32', isMe: true },
  { id: 3, user: '사용자 5', text: '저도 같이 가도 될까요?', date: '2025년 9월 30일', time: '오전 11:15', isMe: false },
  { id: 4, user: '나', text: '네 그럼요! 환영합니다.', date: '2025년 9월 30일', time: '오전 11:16', isMe: true },
];

function ChatRoomPage() {
  let lastDate: string | null = null
    
  return (
    <PageContainer>
      <Header>
        <HeaderButton><IoArrowBack /></HeaderButton>
        <Title>부산 여행 채팅방</Title>
        <HeaderButton><IoMenu /></HeaderButton>
      </Header>
      <MessageList>
        {dummyMessages.map(msg => {
          let dateSeparator = null;
          if (msg.date !== lastDate) {
            dateSeparator = <DateSeparator>{msg.date}</DateSeparator>;
            lastDate = msg.date;
          }

          return (
            <React.Fragment key={msg.id}>
              {dateSeparator}
              <MessageContainer isMe={msg.isMe}>
            {!msg.isMe && (
              <SenderInfo>
                <Avatar />
                <UserName>{msg.user}</UserName>
              </SenderInfo>
            )}
            <BubbleContainer isMe={msg.isMe}>
                {msg.isMe && <Timestamp>{msg.time}</Timestamp>}
                <MessageBubble isMe={msg.isMe}>{msg.text}</MessageBubble>
                {!msg.isMe && <Timestamp>{msg.time}</Timestamp>}
            </BubbleContainer>
              </MessageContainer>
            </React.Fragment>
          );
        })}

      </MessageList>
      <InputContainer>
        <HeaderButton><IoAdd /></HeaderButton>
        <MessageInput placeholder="메세지 입력" />
        <SendButton><IoSend /></SendButton>
      </InputContainer>
    </PageContainer>
  );
}

export default ChatRoomPage;