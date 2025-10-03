import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';

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
  margin-bottom: 24px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  text-decoration: none;
  font-size: 14px;
  margin-top: 16px;
  text-align: center;
`;

function ResetPasswordPage() {
  const [isCodeSent, setIsCodeSent] = useState(false);
  const navigate = useNavigate();

  const handleGetCode = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 아이디/전화번호로 SMS 발송 API 호출
    alert('인증코드가 발송되었습니다.');
    setIsCodeSent(true);
  };
  
  const handleConfirmCode = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 인증코드 확인 API 호출
    alert('인증에 성공했습니다.');
    navigate('/set-new-password');
  };

  return (
    <PageContainer>
      <Title>비밀번호 재설정</Title>
      {!isCodeSent ? (
        <Form onSubmit={handleGetCode}>
          <Input type="text" placeholder="아이디" required />
          <Input type="tel" placeholder="전화번호" required />
          <Button size="large" type="submit" style={{ width: '100%' }}>
            인증코드 받기
          </Button>
        </Form>
      ) : (
        <Form onSubmit={handleConfirmCode}>
          <Input type="text" placeholder="인증코드 입력" required />
          <Button size="large" type="submit" style={{ width: '100%' }}>
            인증코드 확인
          </Button>
        </Form>
      )}
      <StyledLink to="/login">로그인 하러 가기</StyledLink>
    </PageContainer>
  );
}

export default ResetPasswordPage;