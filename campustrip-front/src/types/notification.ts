export type NotificationType =
  | "FOLLOW"
  | "APLLICATION_REQUEST"
  | "APPLICATION_ACCEPT";

export interface PushNotification {
  receiverId: number;
  senderId: number;
  type: NotificationType;
  referenceId: number;
  title: string;
  body: string;
  createdAt: string;
}
