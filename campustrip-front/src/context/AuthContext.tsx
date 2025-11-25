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
}

interface AuthContextType {
  token: string | null;
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
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
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          if (decoded.exp * 1000 > Date.now()) {
            axios.defaults.headers.common["Authorization"] = storedToken;

            // 토큰에서 직접 사용자 정보를 가져와 상태 설정
            setToken(storedToken);
            setUser({
              id: decoded.membershipId,
              userId: decoded.username,
              name: decoded.name,
              role: decoded.role,
            });
          } else {
            // 토큰이 만료된 경우
            console.error("Token expired on load. Logging out.");
            localStorage.removeItem("authToken");
            delete axios.defaults.headers.common["Authorization"];
            window.location.href = "/login";
            alert("세션이 만료되었습니다. 다시 로그인해주세요.");
          }
        } catch (error) {
          console.error("Failed to decode stored token:", error);
          localStorage.removeItem("authToken");
          delete axios.defaults.headers.common["Authorization"];
        }
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem("authToken", newToken);
      axios.defaults.headers.common["Authorization"] = newToken;

      // 토큰에서 직접 사용자 정보를 가져와 상태 설정
      setToken(newToken);
      setUser({
        id: decoded.membershipId,
        userId: decoded.username,
        name: decoded.name,
        role: decoded.role,
      });
    } catch (error) {
      console.error("Failed to decode new token:", error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  };

  const isLoggedIn = !!token && !!user;

  // 인증 정보 로딩 중에는 아무것도 렌더링하지 않음
  if (authLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ token, user, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
