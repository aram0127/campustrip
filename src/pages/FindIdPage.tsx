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
  margin-bottom: 8px;
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
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

function FindIdPage() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 백엔드에 email을 보내 아이디를 찾아오는 API를 호출
    const foundId = 'a67891';
    navigate('/find-id/result', { state: { foundId } });
  };

  return (
    <PageContainer>
      <Title>아이디 찾기</Title>
      <Subtitle>가입 시 등록한 이메일을 입력해주세요.</Subtitle>
      <Form onSubmit={handleSubmit}>
        <Input 
          type="email" 
          placeholder="이메일" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        />
        <Button size="large" type="submit" style={{ width: '100%' }}>확인</Button>
      </Form>
      <StyledLink to="/login">로그인 하러 가기</StyledLink>
    </PageContainer>
  );
}

export default FindIdPage;