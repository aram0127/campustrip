export interface Application {
  id: number;
  applicationStatus: boolean | null;
  applicationDate: string;
  userId: string; // Application.java의 getUserId() 메서드에서 제공
}
