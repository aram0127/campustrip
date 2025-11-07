import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./styles/theme";
import GlobalStyle from "./styles/GlobalStyle";
import MainLayout from "./components/layout/MainLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import FindIdPage from "./pages/auth/FindIdPage";
import FindIdResultPage from "./pages/auth/FindIdResultPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SetNewPasswordPage from "./pages/auth/SetNewPasswordPage";
import ProfilePage from "./pages/profile/ProfilePage";
import PostListPage from "./pages/post/PostListPage";
import ReviewListPage from "./pages/review/ReviewListPage";
import ChatListPage from "./pages/chat/ChatListPage";
import NewChatPage from "./pages/chat/NewChatPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import PlannerListPage from "./pages/planner/PlannerListPage";
import FollowListPage from "./pages/follow/FollowListPage";
import BlockedListPage from "./pages/follow/BlockedListPage";
import NotificationListPage from "./pages/notification/NotificationListPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import PostCreateFlow from "./pages/post/create/PostCreateFlow";
import ApplicantListPage from "./pages/post/ApplicantListPage";
import { AuthProvider, useAuth } from "./context/AuthContext";

import ChatTestPage from "./test/ChatTestPage"; // 채팅테스트

const RootRedirect: React.FC = () => {
  const { isLoggedIn } = useAuth();
  // 로그인 상태면 /posts로, 아니면 /login으로 리디렉션
  return <Navigate to={isLoggedIn ? "/posts" : "/login"} replace />;
};

function App() {
  // 테마 설정
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(systemPrefersDark ? "dark" : "light");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  };

  const currentTheme = theme === "light" ? lightTheme : darkTheme;

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <Routes>
            {/* 루트 경로 접근 시 로그인 상태에 따라 리디렉션 */}
            <Route path="/" element={<RootRedirect />} />

            {/* 로그인/인증 관련 페이지들 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/find-id" element={<FindIdPage />} />
            <Route path="/find-id/result" element={<FindIdResultPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/set-new-password" element={<SetNewPasswordPage />} />

            {/* 로그인이 필요한 페이지들 */}
            <Route path="/profile/:userId" element={<ProfilePage />} />
            <Route path="/chat/new" element={<NewChatPage />} />
            <Route path="/chat/:chatId" element={<ChatRoomPage />} />
            <Route
              path="/profile/:userId/follows"
              element={<FollowListPage />}
            />
            <Route path="/settings/blocked" element={<BlockedListPage />} />
            <Route path="/notifications" element={<NotificationListPage />} />
            <Route path="/posts/:postId" element={<PostDetailPage />} />
            <Route path="/posts/new/*" element={<PostCreateFlow />} />
            <Route
              path="/posts/:postId/applicants"
              element={<ApplicantListPage />}
            />

            <Route path="/test/chat" element={<ChatTestPage />} />

            {/* MainLayout을 사용하는 페이지들 */}
            <Route
              path="/*"
              element={
                <MainLayout currentTheme={theme} toggleTheme={toggleTheme}>
                  <Routes>
                    <Route path="/posts" element={<PostListPage />} />
                    <Route path="/reviews" element={<ReviewListPage />} />
                    <Route path="/chat" element={<ChatListPage />} />
                    <Route path="/planner" element={<PlannerListPage />} />
                  </Routes>
                </MainLayout>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
