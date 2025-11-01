export interface Planner {
  plannerId: number;
  userId: number; // membership_id
  title: string;
  startDate: string;
  endDate: string;

  // (임시) dummyPlanners의 members 필드에 맞춘 타입
  members?: string;
}
