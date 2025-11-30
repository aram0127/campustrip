import { requestFcmToken } from "../firebase";
import { deleteFcmToken } from "../api/fcm";
import { getUserProfile } from "../api/users";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// JWT 토큰 페이로드 타입
interface DecodedToken {
  username: string; // User의 userId
  membershipId: number; // User의 membership_id
  name: string; // User의 name
  role: string;
  iat: number;
  exp: number;
}

// 전역으로 관리할 사용자 정보 타입
export interface UserInfo {
  id: number; // User의 membership_id
  userId: string;
  name: string;
  role: string;
  profilePhotoUrl?: string;
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (newToken: string) => void;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
  refreshProfile: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // 유저 정보를 가져오는 공통 함수
  const fetchUserInfo = async (token: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);

      // 백엔드 API를 호출하여 최신 유저 정보(사진 포함)를 가져옴
      const userProfile = await getUserProfile(decoded.membershipId);

      // 토큰의 권한 정보 + API의 최신 프로필 정보를 합쳐서 상태 업데이트
      setUser({
        id: userProfile.id,
        userId: userProfile.userId,
        name: userProfile.name,
        role: decoded.role,
        profilePhotoUrl: userProfile.profilePhotoUrl,
      });

      // 헤더 및 토큰 상태 설정
      axios.defaults.headers.common["Authorization"] = token;
      setToken(token);
    } catch (error) {
      console.error("유저 정보 로드 실패:", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");

      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);

          // 토큰 만료 시간 체크
          if (decoded.exp * 1000 > Date.now()) {
            // 토큰이 유효하면 API를 통해 최신 정보 로드
            await fetchUserInfo(storedToken);
          } else {
            // 토큰 만료 시 로그아웃 처리
            console.error("Token expired on load.");
            logout();
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          }
        } catch (error) {
          console.error("Token decode failed:", error);
          logout();
        }
      }

      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    // 토큰 저장
    localStorage.setItem("authToken", newToken);

    // 공통 함수를 호출하여 API 정보 로드 및 상태 설정
    await fetchUserInfo(newToken);
  };

  const logout = async () => {
    try {
      // 현재 기기의 FCM 토큰 가져오기
      const currentFcmToken = await requestFcmToken();

      // 서버에 토큰 삭제 요청
      if (currentFcmToken && token) {
        await deleteFcmToken(currentFcmToken);
        console.log("서버에서 FCM 토큰 삭제 완료");
      }
    } catch (error) {
      console.error("로그아웃 중 토큰 삭제 실패:", error);
    } finally {
      // 클라이언트 로그아웃 처리
      localStorage.removeItem("authToken");
      setToken(null);
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];

      window.location.href = "/login";
    }
  };

  // 외부에서 호출 가능한 프로필 갱신 함수
  const refreshProfile = async () => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken && user) {
      // 현재 토큰을 이용해 사용자 정보를 다시 받아와 상태(user)를 갱신함
      await fetchUserInfo(storedToken);
    }
  };

  const isLoggedIn = !!token && !!user;

  // 인증 정보 로딩 중에는 아무것도 렌더링하지 않음
  if (authLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isLoggedIn, login, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
