export interface Applicant {
  id: number; // User의 membership_id
  userId: string; // User의 userId
  name: string;
  userScore: number;
  applicationStatus: boolean | null;
}
