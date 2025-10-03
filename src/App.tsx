import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from './styles/theme';
import GlobalStyle from './styles/GlobalStyle';
import MainLayout from './components/layout/MainLayout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import FindIdPage from './pages/FindIdPage';
import FindIdResultPage from './pages/FindIdResultPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import SetNewPasswordPage from './pages/SetNewPasswordPage';
import ProfilePage from './pages/ProfilePage';
import PostListPage from './pages/PostListPage';
import ReviewListPage from './pages/ReviewListPage';
import ChatListPage from './pages/ChatListPage';
import NewChatPage from './pages/NewChatPage';
import ChatRoomPage from './pages/ChatRoomPage';
import PlannerListPage from './pages/PlannerListPage';
import FollowListPage from './pages/FollowListPage';
import BlockedListPage from './pages/BlockedListPage';
import NotificationListPage from './pages/NotificationListPage';

function App() {
  // 테마
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (!savedTheme) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(systemPrefersDark ? 'dark' : 'light');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  const currentTheme = theme === 'light' ? lightTheme : darkTheme;
  
  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/posts" />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/find-id" element={<FindIdPage />} />
          <Route path="/find-id/result" element={<FindIdResultPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/set-new-password" element={<SetNewPasswordPage />} />
          
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/chat/new" element={<NewChatPage />} />
          <Route path="/chat/:chatId" element={<ChatRoomPage />} />
          <Route path="/profile/:userId/follows" element={<FollowListPage />} />
          <Route path="/settings/blocked" element={<BlockedListPage />} />
          <Route path="/notifications" element={<NotificationListPage />} />

          <Route path="/*" element={
            <MainLayout currentTheme={theme} toggleTheme={toggleTheme}>
              <Routes>
                <Route path="/posts" element={<PostListPage />} />
                <Route path="/reviews" element={<ReviewListPage />} />
                <Route path="/chat" element={<ChatListPage />} />
                <Route path="/planner" element={<PlannerListPage />} />
              </Routes>
            </MainLayout>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;