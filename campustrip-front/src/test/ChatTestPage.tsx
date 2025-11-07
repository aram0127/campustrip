import React, { useState, useRef } from "react";
import styled from "styled-components";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { type ChatMessage, MessageTypeValue } from "../types/chat";
import { useAuth } from "../context/AuthContext";

const PageContainer = styled.div`
  padding: 20px;
  font-family: Arial, sans-serif;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px;
  box-sizing: border-box;
  margin-bottom: 10px;
`;

const Button = styled.button`
  padding: 10px 15px;
  margin-right: 10px;
  font-size: 16px;
  cursor: pointer;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  &:disabled {
    background-color: #ccc;
  }
`;

const LogContainer = styled.pre`
  background-color: #f4f4f4;
  border: 1px solid #ddd;
  padding: 10px;
  height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const Status = styled.div<{ $isConnected: boolean }>`
  padding: 10px;
  border-radius: 5px;
  color: white;
  background-color: ${({ $isConnected }) =>
    $isConnected ? "#28a745" : "#dc3545"};
  text-align: center;
  font-weight: bold;
  margin-bottom: 10px;
`;

const UserInfo = styled.div`
  font-size: 18px;
  font-weight: bold;
  padding: 10px;
  background-color: #e0e8ff;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const ChatSendTestPage: React.FC = () => {
  const { user } = useAuth(); // 현재 로그인된 사용자 정보 가져오기
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("19"); // 테스트할 채팅방 ID
  const [message, setMessage] = useState("");
  const [log, setLog] = useState<string[]>([]);

  const stompClientRef = useRef<Client | null>(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const addLog = (entry: string) => {
    setLog((prev) => [
      `[${new Date().toLocaleTimeString()}] ${entry}`,
      ...prev,
    ]);
  };

  const handleConnect = () => {
    if (!user) {
      addLog("❌ 로그인이 필요합니다.");
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      addLog("❌ authToken이 없습니다. 먼저 로그인해주세요.");
      return;
    }

    const client = new Client({
      brokerURL: `${API_BASE_URL.replace("http", "ws")}/ws/chat`,
      webSocketFactory: () => new SockJS(`${API_BASE_URL}/ws/chat`),
      connectHeaders: {
        Authorization: token, // 현재 로그인 토큰 사용
      },
      debug: (str) => addLog(`[DEBUG] ${str}`),
      reconnectDelay: 5000,
    });

    client.onConnect = () => {
      setIsConnected(true);
      addLog(`✅ STOMP 연결 성공. (사용자: ${user.name})`);
    };

    client.onStompError = (frame) => {
      addLog(`❌ STOMP 오류: ${frame.headers["message"]} ${frame.body}`);
      setIsConnected(false);
    };

    client.onDisconnect = () => {
      addLog("🔌 STOMP 연결 해제됨.");
      setIsConnected(false);
    };

    client.activate();
    stompClientRef.current = client;
  };

  const handleDisconnect = () => {
    if (stompClientRef.current?.active) {
      stompClientRef.current.deactivate();
    }
    stompClientRef.current = null;
    setIsConnected(false);
  };

  // 메시지 전송 테스트
  const handleSend = () => {
    if (!stompClientRef.current?.active || !user) {
      addLog(
        "❌ 연결되지 않았거나 사용자가 없습니다. 메시지를 보낼 수 없습니다."
      );
      return;
    }

    const chatMessage: ChatMessage = {
      messageType: MessageTypeValue.CHAT, // CHAT 타입
      roomId: roomId,
      userName: user.name, // 로그인된 사용자 이름 사용
      message: message,
    };

    // app/controller/ChatController.java의 @MessageMapping("/chat/message")로 전송
    stompClientRef.current.publish({
      destination: "/pub/chat/message",
      body: JSON.stringify(chatMessage),
    });

    addLog(`📤 메시지 전송 (Room: ${roomId}): ${message}`);
    setMessage("");
  };

  return (
    <PageContainer>
      <Title>WebSocket 메시지 전송 테스트</Title>

      {!user ? (
        <Status $isConnected={false}>로그인이 필요합니다.</Status>
      ) : (
        <>
          <UserInfo>
            로그인된 계정: {user.name} (ID: {user.userId})
          </UserInfo>

          <Section>
            <Status $isConnected={isConnected}>
              {isConnected ? "연결됨" : "연결 끊김"}
            </Status>
            <Label htmlFor="room-id">전송할 채팅방 ID (roomId):</Label>
            <Input
              id="room-id"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              disabled={isConnected}
            />
            <Button onClick={handleConnect} disabled={isConnected}>
              연결
            </Button>
            <Button
              onClick={handleDisconnect}
              disabled={!isConnected}
              style={{ backgroundColor: "#6c757d" }}
            >
              연결 끊기
            </Button>
          </Section>

          <Section>
            <Label htmlFor="message">메시지 내용:</Label>
            <Input
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={!isConnected}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
            />
            <Button onClick={handleSend} disabled={!isConnected}>
              전송 (Publish)
            </Button>
          </Section>
        </>
      )}

      <Section>
        <Label>연결 및 전송 로그 (수신 기능 없음)</Label>
        <LogContainer>
          {log.map((entry, index) => (
            <div key={index}>{entry}</div>
          ))}
        </LogContainer>
      </Section>
    </PageContainer>
  );
};

export default ChatSendTestPage;
