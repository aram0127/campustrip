export interface Post {
  postId: number;
  title: string;
  body: string;
  createdAt: string;
  updatedAt?: string | null;
  teamSize: number;
  // User 정보
  user: {
    id: number;
    name: string;
    userId: string;
  };
  // Region 정보
  regions: {
    regionId: number;
    regionName: string;
  }[];
}
