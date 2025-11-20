import { type User } from "./user";

export interface Planner {
  plannerId: number;
  user: User;
  title: string;
  startDate: string;
  endDate: string;
}
