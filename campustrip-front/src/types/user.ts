export interface User {
  id: number;
  name: string;
  userId: string;
  phoneNumber: string | null;
  email: string;
  schoolEmail: string;
  mbti: string | null;
  preference: number | null;
  userScore: number;
  role: number;
}
