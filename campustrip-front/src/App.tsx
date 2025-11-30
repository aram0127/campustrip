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
import Toast from "./components/common/Toast";
import MainLayout from "./components/layout/MainLayout";
import { onMessageListener } from "./firebase";
import { useQueryClient } from "@tanstack/react-query";

import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import FindIdPage from "./pages/auth/FindIdPage";
import FindIdResultPage from "./pages/auth/FindIdResultPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SetNewPasswordPage from "./pages/auth/SetNewPasswordPage";
import ProfilePage from "./pages/profile/ProfilePage";
import FollowListPage from "./pages/follow/FollowListPage";
import BlockedListPage from "./pages/follow/BlockedListPage";
import ChatListPage from "./pages/chat/ChatListPage";
import NewChatPage from "./pages/chat/NewChatPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import PostListPage from "./pages/post/PostListPage";
import PostDetailPage from "./pages/post/PostDetailPage";
import PostCreateFlow from "./pages/post/create/PostCreateFlow";
import ApplicantListPage from "./pages/post/ApplicantListPage";
import ReviewListPage from "./pages/review/ReviewListPage";
import PlannerListPage from "./pages/planner/PlannerListPage";
import PlannerDetailPage from "./pages/planner/PlannerDetailPage";
import PlannerCreatePage from "./pages/planner/PlannerCreatePage";
import PlannerEditPage from "./pages/planner/PlannerEditPage";
import LocationSharePage from "./pages/location/LocationSharePage";
import NotificationListPage from "./pages/notification/NotificationListPage";
import PostEditLoader from "./pages/post/edit/PostEditLoader";
import { AuthProvider, useAuth } from "./context/AuthContext";
import TravelTestPage from "./pages/profile/TravelTestPage.tsx";
import { PostCreateProvider } from "./context/PostCreateContext";
import ReviewCreatePage from "./pages/review/ReviewCreatePage";
import ReviewDetailPage from "./pages/review/ReviewDetailPage";
import FCMTestPage from "./test/FCMTestPage.tsx";
import PersonalInfoPage from "./pages/profile/PersonalInfoPage";
import ProfileEditPage from "./pages/profile/ProfileEditPage";

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

  // Toast 상태 관리
  const [toast, setToast] = useState<{
    title: string;
    body: string;
    visible: boolean;
  }>({
    title: "",
    body: "",
    visible: false,
  });

  const queryClient = useQueryClient();

  // 포그라운드 메시지 수신 리스너
  useEffect(() => {
    const unsubscribe = onMessageListener((payload: any) => {
      console.log("포그라운드 알림 수신:", payload);

      const { notification, data } = payload;

      // 채팅 메시지가 오면 쿼리를 무효화하여 목록 갱신
      if (data?.type === "CHAT_MESSAGE") {
        queryClient.invalidateQueries({ queryKey: ["myChats"] });
      }

      const currentPath = window.location.pathname;
      const match = currentPath.match(/^\/chat\/(\d+)$/);
      const currentChatId = match ? match[1] : null;

      // 현재 보고 있는 채팅방의 알림이면 무시
      if (
        data?.type === "CHAT_MESSAGE" &&
        String(data?.referenceId) === currentChatId
      ) {
        console.log("현재 채팅방 알림이므로 무시합니다.");
        return;
      }

      if (notification) {
        setToast({
          title: notification.title || "알림",
          body: notification.body || "새로운 메시지가 도착했습니다.",
          visible: true,
        });
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [queryClient]);

  // Toast 닫기 핸들러
  const closeToast = () => {
    setToast((prev) => ({ ...prev, visible: false }));
  };

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <PostCreateProvider>
            <Toast
              title={toast.title}
              body={toast.body}
              isVisible={toast.visible}
              onClose={closeToast}
            />

            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/find-id" element={<FindIdPage />} />
              <Route path="/find-id/result" element={<FindIdResultPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route
                path="/set-new-password"
                element={<SetNewPasswordPage />}
              />

              {/* Profile */}
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route
                path="/profile/:userId/follows"
                element={<FollowListPage />}
              />
              <Route path="/settings/blocked" element={<BlockedListPage />} />
              <Route path="/notifications" element={<NotificationListPage />} />
              <Route
                path="/settings/personal-info"
                element={<PersonalInfoPage />}
              />
              <Route path="/test/travel" element={<TravelTestPage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />

              {/* Posts */}
              <Route path="/posts/:postId" element={<PostDetailPage />} />
              <Route path="/posts/new/*" element={<PostCreateFlow />} />
              <Route
                path="/posts/edit/:postId/*"
                element={<PostEditLoader />}
              />
              <Route
                path="/posts/:postId/applicants"
                element={<ApplicantListPage />}
              />
              <Route
                path="/location/:chatRoomId"
                element={<LocationSharePage />}
              />

              {/* Review */}
              <Route path="/reviews/new" element={<ReviewCreatePage />} />
              <Route path="/reviews/:reviewId" element={<ReviewDetailPage />} />

              {/* Planner */}
              <Route path="/planner/create" element={<PlannerCreatePage />} />
              <Route path="/planner/edit/:id" element={<PlannerEditPage />} />
              <Route path="/planner/:id" element={<PlannerDetailPage />} />

              {/* Chat */}
              <Route path="/chat/:chatId" element={<ChatRoomPage />} />
              <Route path="/chat/new" element={<NewChatPage />} />

              {/* Test */}
              <Route path="/test/fcm" element={<FCMTestPage />} />

              {/* Main Layout */}
              <Route
                path="/*"
                element={
                  <MainLayout currentTheme={theme} toggleTheme={toggleTheme}>
                    <Routes>
                      <Route path="/posts" element={<PostListPage />} />
                      <Route path="/reviews" element={<ReviewListPage />} />
                      <Route path="/planner" element={<PlannerListPage />} />
                      <Route path="/chat" element={<ChatListPage />} />
                    </Routes>
                  </MainLayout>
                }
              />
            </Routes>
          </PostCreateProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
