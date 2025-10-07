import React, { useState } from 'react';
import styled from 'styled-components';
import TopBar from '../common/TopBar';
import BottomNav from '../common/BottomNav';
import SideMenu from '../common/SideMenu';

const AppContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const MainContent = styled.main`
  flex-grow: 1;
  overflow-y: auto;
  height: 0;
`;

interface MainLayoutProps {
  children: React.ReactNode;
  currentTheme: string;
  toggleTheme: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, currentTheme, toggleTheme }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <AppContainer>
      <TopBar onProfileClick={() => setIsMenuOpen(true)} />
      <MainContent>
        {children}
      </MainContent>
      <BottomNav />
      <SideMenu 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)} 
        currentTheme={currentTheme}
        toggleTheme={toggleTheme}
      />
    </AppContainer>
  );
};

export default MainLayout;