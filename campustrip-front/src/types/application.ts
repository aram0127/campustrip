import { type Post } from "./post";

export interface Application {
  id?: number;
  applicationStatus: boolean | null;
  applicationDate: string;
  userId: string;
  post: Post;
}
