// 백엔드의 app/dto/MessageType.java
export type MessageType = "JOIN" | "CHAT" | "LEAVE";

export const MessageTypeValue = {
  JOIN: "JOIN",
  CHAT: "CHAT",
  LEAVE: "LEAVE",
} as const;

// 백엔드의 app/dto/ChatDTO.java
export interface Chat {
  id: number;
  createdAt: string;
  title: string;
}

// 백엔드의 app/dto/ChatMessage.java
export interface ChatMessage {
  messageType: MessageType;
  roomId: string;
  userName: string;
  message: string;
  timestamp?: string;
}
