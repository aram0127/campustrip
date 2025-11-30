export interface User {
  id: number;
  name: string;
  gender: string | null;
  userId: string;
  phoneNumber: string;
  email: string;
  schoolEmail: string;
  description: string | null;
  preference: number | null;
  userScore: number;
  role: number;
  profilePhotoUrl: string;
  university: string;
  universityId: number;
}
