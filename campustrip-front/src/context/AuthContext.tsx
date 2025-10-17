import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  type ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { type User as FullUser } from "../types/user.ts";

// JWT 토큰 페이로드 타입
interface DecodedToken {
  username: string; // User의 userId
  role: string;
  iat: number;
  exp: number;
}

// 전역으로 관리할 사용자 정보 타입
interface UserInfo {
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

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("authToken");
      if (storedToken) {
        try {
          const decoded = jwtDecode<DecodedToken>(storedToken);
          if (decoded.exp * 1000 > Date.now()) {
            axios.defaults.headers.common["Authorization"] = storedToken;

            // NOTE: This is an inefficient workaround because the backend doesn't provide user ID in the JWT.
            // This should be replaced with a proper `/api/users/me` endpoint in the future.
            try {
              const allUsersResponse = await axios.get<FullUser[]>(
                `${API_BASE_URL}/api/users/all`
              );
              const currentUser = allUsersResponse.data.find(
                (u) => u.userId === decoded.username
              );

              if (currentUser) {
                setToken(storedToken);
                setUser({
                  id: currentUser.id,
                  userId: currentUser.userId,
                  name: currentUser.name,
                  role: decoded.role,
                });
              } else {
                throw new Error("Current user not found in all users list.");
              }
            } catch (fetchErr) {
              console.error("Failed to fetch user data after login:", fetchErr);
              localStorage.removeItem("authToken");
            }
          } else {
            localStorage.removeItem("authToken");
          }
        } catch (error) {
          console.error("Failed to decode stored token:", error);
          localStorage.removeItem("authToken");
        }
      }
      setAuthLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (newToken: string) => {
    try {
      const decoded = jwtDecode<DecodedToken>(newToken);
      localStorage.setItem("authToken", newToken);
      axios.defaults.headers.common["Authorization"] = newToken;

      // NOTE: Inefficient workaround. See note in useEffect.
      try {
        const allUsersResponse = await axios.get<FullUser[]>(
          `${API_BASE_URL}/api/users/all`
        );
        const currentUser = allUsersResponse.data.find(
          (u) => u.userId === decoded.username
        );

        if (currentUser) {
          setToken(newToken);
          setUser({
            id: currentUser.id,
            userId: currentUser.userId,
            name: currentUser.name,
            role: decoded.role,
          });
        } else {
          throw new Error("Current user not found in all users list.");
        }
      } catch (fetchErr) {
        console.error("Failed to fetch user data after login:", fetchErr);
        logout(); // Log out if user fetch fails
      }
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
