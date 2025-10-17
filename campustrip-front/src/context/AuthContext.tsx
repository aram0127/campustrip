import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";

interface AuthContextType {
  token: string | null;
  isLoggedIn: boolean;
  login: (newToken: string) => void;
  logout: () => void;
}

// 초기값 설정
const AuthContext = createContext<AuthContextType>({
  token: null,
  isLoggedIn: false,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("authToken")
  );
  const isLoggedIn = !!token; // 토큰 유무로 로그인 상태 결정

  // 앱 시작 시 로컬 스토리지 토큰 확인 및 axios 기본 헤더 설정
  useEffect(() => {
    const storedToken = localStorage.getItem("authToken");
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common["Authorization"] = storedToken;
    }
  }, []);

  // 로그인 함수: 토큰 저장 및 axios 헤더 설정
  const login = (newToken: string) => {
    localStorage.setItem("authToken", newToken);
    setToken(newToken);
    axios.defaults.headers.common["Authorization"] = newToken;
  };

  // 로그아웃 함수: 토큰 제거 및 axios 헤더 제거
  const logout = () => {
    localStorage.removeItem("authToken");
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
    // 로그인 페이지로 리디렉션
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
