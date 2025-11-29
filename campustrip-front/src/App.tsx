import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
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
<<<<<<< HEAD
import TravelTestPage from "./test/TravelTestPage";
=======
>>>>>>> d56d7f4bb82081862dbf8805a21f095f464437fc
import { PostCreateProvider } from "./context/PostCreateContext";
import ReviewCreatePage from "./pages/review/ReviewCreatePage";
import ReviewDetailPage from "./pages/review/ReviewDetailPage";
import FCMTestPage from "./pages/test/FCMTestPage";
import { requestFcmToken, onMessageListener } from "./firebase";
import PersonalInfoPage from "./pages/profile/PersonalInfoPage";
// import { apiClient } from "./api/client"; // 나중에 주석 해제

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

  useEffect(() => {
    // FCM 초기화 및 토큰 확인 로그 (백엔드 전송 X)
    const handleFcmToken = async () => {
      const token = await requestFcmToken();
      if (token) {
        console.log("✅ FCM 토큰 발급 성공:", token);

        // --- [나중에 백엔드 준비되면 주석 해제할 부분, api 경로는 예시] ---
        // try {
        //    await apiClient.post("/api/users/fcm-token", { token });
        //    console.log("토큰 서버 전송 완료");
        // } catch (e) {
        //    console.error("토큰 서버 전송 실패", e);
        // }
        // ----------------------------------------------
      } else {
        console.log("❌ 알림 권한이 없거나 토큰 발급 실패");
      }
    };

    handleFcmToken();

    // 포그라운드 메시지 수신 리스너 (테스트용)
    onMessageListener().then((payload) => {
      console.log("🔔 포그라운드 알림 수신:", payload);
      const notif = payload as { notification?: { title?: string; body?: string } };
      alert(`${notif.notification?.title}: ${notif.notification?.body}`);
    });
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <AuthProvider>
        <Router>
          <PostCreateProvider>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Auth */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/find-id" element={<FindIdPage />} />
              <Route path="/find-id/result" element={<FindIdResultPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/set-new-password" element={<SetNewPasswordPage />} />

              {/* Profile */}
              <Route path="/profile/:userId" element={<ProfilePage />} />
              <Route path="/profile/:userId/follows" element={<FollowListPage />} />
              <Route path="/settings/blocked" element={<BlockedListPage />} />
              <Route path="/notifications" element={<NotificationListPage />} />

              {/* Chat */}
              <Route path="/chat/new" element={<NewChatPage />} />
              <Route path="/chat/:chatId" element={<ChatRoomPage />} />

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
              <Route path="/reviews/new" element={<ReviewCreatePage />} />
              <Route path="/reviews/:reviewId" element={<ReviewDetailPage />} />
              <Route
                path="/settings/personal-info"
                element={<PersonalInfoPage />}
              />
              <Route path="/test/fcm" element={<FCMTestPage />} />

              {/* Test */}
              <Route path="/test/travel" element={<TravelTestPage />} />

              {/* Planner */}
              <Route path="/planner/create" element={<PlannerCreatePage />} />
              <Route path="/planner/edit/:id" element={<PlannerEditPage />} />
              <Route path="/planner/:id" element={<PlannerDetailPage />} />

              {/* Main Layout */}
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
          </PostCreateProvider>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
