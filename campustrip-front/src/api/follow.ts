import { apiClient } from "./client";
import { type User } from "../types/user";

/* 특정 유저의 팔로워 목록을 가져옴 */
export const getFollowers = async (userId: number): Promise<User[]> => {
  const response = await apiClient.get<User[]>(`/api/follow/followers`, {
    params: { userId },
  });
  return response.data;
};

/* 특정 유저의 팔로잉 목록을 가져옴 */
export const getFollowings = async (userId: number): Promise<User[]> => {
  const response = await apiClient.get<User[]>(`/api/follow/followings`, {
    params: { userId },
  });
  return response.data;
};

/* 다른 유저를 팔로우 */
export const followUser = async (followerId: number, followeeId: number) => {
  const response = await apiClient.put(
    `/api/follow/follow?followerId=${followerId}&followeeId=${followeeId}`
  );
  return response.data;
};

/* 다른 유저를 언팔로우 */
export const unfollowUser = async (followerId: number, followeeId: number) => {
  const response = await apiClient.put(
    `/api/follow/unfollow?followerId=${followerId}&followeeId=${followeeId}`
  );
  return response.data;
};

/* 특정 유저의 팔로워 수를 가져옴 */
export const getFollowerCount = async (userId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/api/follow/followerCount`, {
    params: { userId },
  });
  return response.data;
};

/* 특정 유저의 팔로잉 수를 가져옴 */
export const getFollowingCount = async (userId: number): Promise<number> => {
  const response = await apiClient.get<number>(`/api/follow/followingCount`, {
    params: { userId },
  });
  return response.data;
};
