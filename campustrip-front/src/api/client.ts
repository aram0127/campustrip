import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터 추가
apiClient.interceptors.request.use(
  (config) => {
    // 로컬 스토리지에서 토큰을 가져옴
    const token = localStorage.getItem("authToken");
    if (token) {
      // 토큰이 있다면 모든 요청 헤더에 'Authorization'을 추가
      config.headers["Authorization"] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
