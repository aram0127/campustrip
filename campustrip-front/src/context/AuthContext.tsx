import { requestFcmToken } from "../firebase";
import { deleteFcmToken } from "../api/fcm";
import { logoutAPI } from "../api/auth";
import { getUserProfile } from "../api/users";
import { getToken, setTokens, removeTokens } from "../utils/token";

import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
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
  login: (accessToken: string, refreshToken: string, remember: boolean) => void;
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
  const fetchUserInfo = async (accessToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(accessToken);

      const userProfile = await getUserProfile(decoded.membershipId);

      // 상태 업데이트
      setUser({
        id: userProfile.id,
        userId: userProfile.userId,
        name: userProfile.name,
        role: decoded.role,
        profilePhotoUrl: userProfile.profilePhotoUrl,
      });

      setToken(accessToken);
    } catch (error) {
      console.error("유저 정보 로드 실패:", error);
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = getToken();

      if (storedToken) {
        await fetchUserInfo(storedToken);
      }

      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (
    accessToken: string,
    refreshToken: string,
    remember: boolean
  ) => {
    setTokens(accessToken, refreshToken, remember);
    await fetchUserInfo(accessToken);
  };

  const logout = async () => {
    try {
      // FCM 토큰 삭제
      const currentFcmToken = await requestFcmToken();
      if (currentFcmToken) {
        await deleteFcmToken(currentFcmToken);
        console.log("서버에서 FCM 토큰 삭제 완료");
      }

      // 서버의 Refresh Token 삭제 요청
      if (user?.userId) {
        await logoutAPI(user.userId);
        console.log("서버에서 Refresh Token 삭제 완료");
      }
    } catch (error) {
      console.error("로그아웃 중 서버 요청 실패:", error);
    } finally {
      // 클라이언트 데이터 정리
      removeTokens();
      setToken(null);
      setUser(null);

      window.location.href = "/login";
    }
  };

  // 외부에서 호출 가능한 프로필 갱신 함수
  const refreshProfile = async () => {
    const storedToken = getToken();
    if (storedToken && user) {
      await fetchUserInfo(storedToken);
    }
  };

  const isLoggedIn = !!token && !!user;

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
