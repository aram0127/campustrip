import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";

const PageContainer = styled.div`
  max-width: 480px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  height: 100dvh;
  display: flex;
  flex-direction: column;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  position: sticky;
  top: 0;
  background-color: ${({ theme }) => theme.colors.background};
  z-index: 10;
  height: 56px;
  box-sizing: border-box;
  padding-top: env(safe-area-inset-top);
`;

const BackButton = styled.button`
  background: none;
  border: none;
  color: inherit;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  margin-left: -12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
`;

const HeaderTitle = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0;
  flex-grow: 1; /* 제목이 남은 공간을 차지 */
`;

export const ScrollingContent = styled.main`
  flex-grow: 1;
  overflow-y: auto;
  height: 0; /* ◀ flex-grow와 함께 스크롤 영역을 만들기 위한 트릭 */
`;

interface PageLayoutProps {
  title: string;
  showBackButton?: boolean;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  onBackClick?: () => void;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  showBackButton = true,
  headerRight,
  children,
  onBackClick,
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBackClick) {
      onBackClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <PageContainer>
      <Header>
        {showBackButton && (
          <BackButton onClick={handleBack}>
            <IoArrowBack />
          </BackButton>
        )}
        <HeaderTitle>{title}</HeaderTitle>
        {headerRight}
      </Header>
      {children}
    </PageContainer>
  );
};

export default PageLayout;
