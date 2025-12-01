export type NotificationType =
  | "FOLLOW"
  | "APLLICATION_REQUEST"
  | "APPLICATION_ACCEPT"
  | "APPLICATION_REJECT"
  | "USER_RATED"
  | "REVIEW_COMMENT"
  | "CHAT_MESSAGE";

export interface PushNotification {
  receiverId: number;
  senderId: number;
  type: NotificationType;
  referenceId: number;
  title: string;
  body: string;
  createdAt: string;
}
