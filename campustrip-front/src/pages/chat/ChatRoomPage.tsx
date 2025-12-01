import { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { IoMenu, IoImage, IoSend, IoLocationSharp } from "react-icons/io5";
import { Client, type IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "../../context/AuthContext";
import { type ChatMessage, MessageTypeValue } from "../../types/chat";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import { useQuery } from "@tanstack/react-query";
import {
  getChatHistory,
  getChatMembers,
  sendImageMessage,
} from "../../api/chats";

const MessageListContainer = styled(ScrollingContent)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const MessageBubble = styled.div<{ $isMe?: boolean }>`
  padding: 10px 14px;
  border-radius: 18px;
  border-top-right-radius: ${({ $isMe }) => ($isMe ? "4px" : "18px")};
  border-top-left-radius: ${({ $isMe }) => (!$isMe ? "4px" : "18px")};

  background-color: ${({ $isMe, theme }) =>
    $isMe ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ $isMe, theme }) => ($isMe ? "white" : theme.colors.text)};
  white-space: pre-wrap;
  word-break: break-word;
`;

const ImageBubble = styled.img`
  width: 200px;
  max-width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  cursor: pointer;
  background-color: ${({ theme }) => theme.colors.inputBackground};
`;

const Timestamp = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 2px;
  flex-shrink: 0;
`;

const MessageContainer = styled.div<{ $isMe?: boolean }>`
  display: flex;
  flex-direction: column;
  width: 100%;
  align-items: ${({ $isMe }) => ($isMe ? "flex-end" : "flex-start")};
`;

const SenderInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
`;

const UserName = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
`;

const BubbleContainer = styled.div<{ $isMe?: boolean }>`
  display: flex;
  align-items: flex-end;
  gap: 6px;
  max-width: 80%;
`;

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
  padding-bottom: env(safe-area-inset-bottom);
  background-color: ${({ theme }) => theme.colors.background};
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

const HeaderButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text};
  font-size: 24px;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const SendButton = styled(HeaderButton)`
  color: ${({ theme }) => theme.colors.primary};
`;

const DateSeparator = styled.div`
  text-align: center;
  margin: 16px 0;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  font-size: 12px;
  width: 100%;
`;

const Message = styled.p`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

function ChatRoomPage() {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth(); // 현재 로그인한 사용자 정보
  const navigate = useNavigate();

  const [messages, setMessages] = useState<ChatMessage[]>([]); // 실시간 + 과거 메시지
  const [inputValue, setInputValue] = useState("");
  const [roomTitle] = useState("채팅방");
  const stompClientRef = useRef<Client | null>(null);
  const messageListRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 input ref
  const [isHistoryLoaded, setIsHistoryLoaded] = useState(false); // 중복 로드 방지

  // 채팅방 멤버 목록 조회
  const { data: members = [] } = useQuery({
    queryKey: ["chatMembers", chatId],
    queryFn: () => getChatMembers(chatId!),
    enabled: !!chatId,
    staleTime: 1000 * 60 * 5,
  });

  // 멤버 ID로 프로필 사진 URL을 빠르게 찾기 위한 헬퍼 함수
  const getProfileImage = (userId: number) => {
    const member = members.find((m) => m.userId === userId);
    return member?.profilePhotoUrl;
  };

  // 채팅 내역 불러오기
  const {
    data: historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useQuery({
    queryKey: ["chatHistory", chatId],
    queryFn: () => getChatHistory(chatId!),
    enabled: !!chatId,
    refetchOnWindowFocus: false,
  });

  // historyData 로딩 시 state 업데이트
  useEffect(() => {
    if (historyData) {
      setMessages(historyData);
      setIsHistoryLoaded(true);
    }
  }, [historyData]); // historyData가 변경될 때마다 실행

  useEffect(() => {
    if (!chatId || !user || !isHistoryLoaded) return;

    // STOMP 클라이언트 생성
    const client = new Client({
      // 백엔드 WebSocketConfig.java의 /ws/chat 엔드포인트
      brokerURL: `${import.meta.env.VITE_API_BASE_URL.replace(
        "http",
        "ws"
      )}/ws/chat`,
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws/chat`),
      connectHeaders: {
        Authorization: localStorage.getItem("authToken") || "",
      },
      debug: (str) => {
        console.log(new Date(), str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    // 연결 성공 시
    client.onConnect = () => {
      console.log("WebSocket 연결 성공");

      // 채팅방 구독 (KafkaConsumerService가 여기로 메시지 전송)
      client.subscribe(`/topic/chat/room/${chatId}`, (message: IMessage) => {
        const receivedMessage = JSON.parse(message.body) as ChatMessage;
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    };

    // 연결 오류 시
    client.onStompError = (frame) => {
      console.error("Broker reported error: " + frame.headers["message"]);
      console.error("Additional details: " + frame.body);
    };

    // 클라이언트 활성화
    client.activate();
    stompClientRef.current = client;
  }, [chatId, user, isHistoryLoaded]); // user와 chatId가 변경될 때마다 재연결

  // 텍스트 메시지 전송 핸들러
  const handleSend = () => {
    if (inputValue.trim() && stompClientRef.current?.active && user) {
      const chatMessage: ChatMessage = {
        messageType: MessageTypeValue.CHAT,
        roomId: chatId!,
        userName: user.name,
        membershipId: user.id,
        message: inputValue,
      };

      stompClientRef.current.publish({
        destination: "/pub/chat/message", // @MessageMapping("/chat/message")
        body: JSON.stringify(chatMessage),
      });

      setInputValue("");
    }
  };

  // 이미지 파일 선택 핸들러
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && user && chatId) {
      const file = e.target.files[0];
      try {
        // 이미지 전송 API 호출
        await sendImageMessage(Number(chatId), user.id, user.name, file);
      } catch (err) {
        console.error("이미지 전송 실패", err);
        alert("이미지 전송에 실패했습니다.");
      } finally {
        // input 초기화 (동일 파일 재선택 가능하게)
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  const formatTimestamp = (timestamp: string | undefined) => {
    if (!timestamp) return "";
    try {
      return new Date(timestamp).toLocaleTimeString("ko-KR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (e) {
      return "";
    }
  };

  // 최초 로딩, 새 메시지 수신 시 스크롤 하단으로 이동
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages, isHistoryLoaded]);

  return (
    <PageLayout
      title={roomTitle}
      headerRight={
        <>
          <HeaderButton onClick={() => navigate(`/location/${chatId}`)}>
            <IoLocationSharp />
          </HeaderButton>
          <HeaderButton
            style={{ marginRight: "-12px" }}
            onClick={() => navigate(`/chat/${chatId}/menu`)}
          >
            <IoMenu />
          </HeaderButton>
        </>
      }
      onBackClick={() => navigate(-1)}
    >
      <MessageListContainer ref={messageListRef}>
        {isHistoryLoading && <Message>대화 내역을 불러오는 중...</Message>}
        {historyError && <Message>대화 내역 로딩 실패</Message>}

        {isHistoryLoaded &&
          messages.map((msg, index) => {
            const isMe = msg.userName === user?.name;

            if (msg.messageType === "JOIN" || msg.messageType === "LEAVE") {
              return (
                <DateSeparator
                  key={msg.timestamp ? msg.timestamp + index : index}
                >
                  {msg.message}
                </DateSeparator>
              );
            }

            return (
              <MessageContainer
                key={msg.timestamp ? msg.timestamp + index : index}
                $isMe={isMe}
              >
                {/* 상대방일 경우 이름과 아바타 표시 */}
                {!isMe && (
                  <SenderInfo>
                    <Avatar $imageUrl={getProfileImage(msg.membershipId)} />
                    <UserName>{msg.userName}</UserName>
                  </SenderInfo>
                )}

                <BubbleContainer $isMe={isMe}>
                  {/* 내가 보낸 메시지: 타임스탬프가 왼쪽 */}
                  {isMe && (
                    <Timestamp>{formatTimestamp(msg.timestamp)}</Timestamp>
                  )}

                  {/* 메시지 내용 (이미지 or 텍스트) */}
                  {msg.messageType === "IMAGE" ? (
                    <ImageBubble
                      src={msg.imageUrl}
                      alt="전송된 이미지"
                      onClick={() => window.open(msg.imageUrl, "_blank")}
                    />
                  ) : (
                    <MessageBubble $isMe={isMe}>{msg.message}</MessageBubble>
                  )}

                  {/* 상대방이 보낸 메시지: 타임스탬프가 오른쪽 */}
                  {!isMe && (
                    <Timestamp>{formatTimestamp(msg.timestamp)}</Timestamp>
                  )}
                </BubbleContainer>
              </MessageContainer>
            );
          })}
      </MessageListContainer>

      <InputContainer>
        <HeaderButton
          style={{ marginLeft: "-4px" }}
          onClick={() => fileInputRef.current?.click()}
        >
          <IoImage />
        </HeaderButton>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: "none" }}
          accept="image/*"
          onChange={handleImageSelect}
        />
        <MessageInput
          placeholder="메세지 입력"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          disabled={!isHistoryLoaded}
        />
        <SendButton
          onClick={handleSend}
          style={{ marginRight: "-4px" }}
          disabled={!isHistoryLoaded || !stompClientRef.current?.active}
        >
          <IoSend />
        </SendButton>
      </InputContainer>
    </PageLayout>
  );
}

export default ChatRoomPage;
