import React from 'react';
import styled from 'styled-components';
import { Link, useLocation } from 'react-router-dom';
import Button from '../components/common/Button';

const PageContainer = styled.div`
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
  font-size: 24px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-bottom: 24px;
`;

const ResultContainer = styled.div`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const ResultBox = styled.div`
  width: 100%;
  padding: 16px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-weight: bold;
  box-sizing: border-box;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  text-decoration: none;
  font-size: 14px;
  margin-top: 4px;
`;

function FindIdResultPage() {
  const location = useLocation();
  // 이전 페이지에서 navigate로 전달한 state를 받음
  const foundId = location.state?.foundId || '아이디 정보 없음';

  return (
    <PageContainer>
      <Title>아이디 찾기 결과</Title>
      <Subtitle>입력하신 정보와 일치하는 아이디입니다.</Subtitle>
      <ResultContainer>
        <ResultBox>{foundId}</ResultBox>
        <Button 
          as={Link} 
          to="/login" 
          size="large" 
          style={{ 
          width: '100%', 
          textDecoration: 'none', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: '51px', 
          padding: '0'
          }}
        >
          로그인 하기
        </Button>
        <StyledLink to="/reset-password">비밀번호 재설정</StyledLink>
      </ResultContainer>
    </PageContainer>
  );
}

export default FindIdResultPage;