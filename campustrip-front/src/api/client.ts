import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10초 타임아웃
});

// 요청 인터셉터
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

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => {
    // 2xx 범위의 상태 코드는 이 함수를 트리거
    return response;
  },
  (error) => {
    // 2xx 외의 범위는 이 함수를 트리거
    if (axios.isAxiosError(error) && error.response) {
      if (error.response.status === 401) {
        // 401 (미인증) 에러 처리
        console.error("401 Error: Unauthorized. Logging out.");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
        alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      }
    }
    return Promise.reject(error);
  }
);
