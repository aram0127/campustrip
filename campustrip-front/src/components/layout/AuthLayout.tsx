import React from "react";
import styled from "styled-components";

const AuthPageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  min-height: 100vh;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.title};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  margin-bottom: 24px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 24px;
  text-align: center;
  margin-top: -16px;
`;

interface AuthLayoutProps {
  title: string;
  subtitle?: string; // 서브타이틀은 선택적
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <AuthPageContainer>
      <Title>{title}</Title>
      {subtitle && <Subtitle>{subtitle}</Subtitle>}
      {children}
    </AuthPageContainer>
  );
};

export default AuthLayout;
