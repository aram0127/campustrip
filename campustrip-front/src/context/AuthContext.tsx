import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

// JWT 토큰에서 디코딩할 사용자 정보의 타입
// 백엔드의 JwtUtil.java에서 토큰 생성 시 id(membership_id)를 추가해야 합니다.
interface DecodedToken {
  id: number; // User의 membership_id
  username: string; // User의 userId
  role: string;
  iat: number;
  exp: number;
}

// Context에서 전역으로 관리할 사용자 정보 타입
interface UserInfo {
  id: number;
  userId: string;
  role: string;
}

// AuthContext가 제공할 값들의 타입
interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

// Context 생성 (초기값 설정)
const AuthContext = createContext<AuthContextType>({
  token: null,
  user: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);

  // 앱 시작 시 로컬 스토리지에서 토큰을 확인하고 상태를 초기화
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      try {
        const decoded = jwtDecode<DecodedToken>(storedToken);
        // 토큰 만료 시간 확인
        if (decoded.exp * 1000 > Date.now()) {
          setToken(storedToken);
          setUser({
            id: decoded.id,
            userId: decoded.username,
            role: decoded.role,
          });
          axios.defaults.headers.common["Authorization"] = storedToken;
        } else {
          // 토큰이 만료되었으면 제거
          localStorage.removeItem("authToken");
        }
      } catch (error) {
        console.error("저장된 토큰 디코딩 실패:", error);
        localStorage.removeItem("authToken");
      }
    }
  }, []);

  // 로그인 함수
  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem("authToken", newToken);
      setToken(newToken);
      setUser({ id: decoded.id, userId: decoded.username, role: decoded.role });
      axios.defaults.headers.common["Authorization"] = newToken;
    } catch (error) {
      console.error("새 토큰 디코딩 실패:", error);
      // 디코딩 실패 시 상태를 초기화
      logout();
    }
  };

  // 로그아웃 함수
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
    // 로그인 페이지로 리디렉션 (선택적)
    // window.location.href = "/login";
  };

  const isLoggedIn = !!token;

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// 커스텀 훅
export const useAuth = () => useContext(AuthContext);
