import axios from "axios";
import { refreshTokenAPI } from "./auth";
import {
  getToken,
  getRefreshToken,
  updateTokens,
  removeTokens,
} from "../utils/token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken(); // [변경] 유틸 함수 사용 (local/session 자동 체크)
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고, 재시도한 요청이 아닐 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // 무한 루프 방지 플래그

      try {
        const storedRefreshToken = getRefreshToken();
        if (!storedRefreshToken) {
          throw new Error("No refresh token");
        }

        // 토큰 갱신 요청
        const { accessToken, refreshToken: newRefreshToken } =
          await refreshTokenAPI(storedRefreshToken);

        // 새로운 토큰 저장
        updateTokens(accessToken, newRefreshToken);

        // 실패했던 요청의 헤더 업데이트 후 재요청
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // 갱신 실패 시 로그아웃 처리
        console.error("Token refresh failed:", refreshError);
        removeTokens();
        window.location.href = "/login";
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);
