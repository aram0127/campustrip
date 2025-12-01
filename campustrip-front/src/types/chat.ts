export type MessageType = "JOIN" | "CHAT" | "LEAVE" | "IMAGE";

export const MessageTypeValue = {
  JOIN: "JOIN",
  CHAT: "CHAT",
  LEAVE: "LEAVE",
  IMAGE: "IMAGE",
} as const;

export interface Chat {
  id: number;
  createdAt: string;
  title: string;
  lastMessageType: MessageType;
  senderName: string;
  lastMessage: string;
  lastMessageTime: string;
  profilePhotoUrl?: string;
}

export interface ChatMessage {
  messageType: MessageType;
  roomId: string;
  userName: string;
  membershipId: number;
  message: string;
  imageUrl?: string;
  timestamp?: string;
}

export interface ChatMember {
  chatId: number;
  userId: number;
  userName: string;
  profilePhotoUrl?: string;
  chatTitle?: string;
}
