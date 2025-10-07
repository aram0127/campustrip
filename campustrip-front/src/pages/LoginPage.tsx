import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Checkbox from '../components/common/Checkbox';

const LoginPageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-grow: 1;
  padding: 20px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.title};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  margin-bottom: 24px;
`;

const Form = styled.form`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const OptionsContainer = styled.div`
  width: 100%;
  margin-top: 8px;
  display: flex;
  justify-content: flex-start;
`;

const LinkContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
  font-size: 14px;
`;

const StyledLink = styled(Link)`
  color: ${({ theme }) => theme.colors.grey};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

function LoginPage() {
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 백엔드에 id, password를 보내 로그인 API를 호출하고 성공 시 토큰을 받아 저장
    alert('로그인에 성공했습니다.');
    // 로그인 성공 후 '/posts' 경로로 이동
    navigate('/posts');
  };

  return (
    <LoginPageContainer>
      <Title>Campus Trip</Title>
      <Form onSubmit={handleLogin}>
        <Input 
          type="text" 
          placeholder="아이디" 
          value={id}
          onChange={(e) => setId(e.target.value)}
          required 
        />
        <Input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        />
        <OptionsContainer>
          <Checkbox label="로그인 상태 유지" />
        </OptionsContainer>
        <Button size="large" type="submit" style={{ marginTop: '8px', width: '100%' }}>
          로그인
        </Button>
      </Form>
      <LinkContainer>
        <StyledLink to="/find-id">아이디 찾기</StyledLink>
        <StyledLink to="/reset-password">비밀번호 재설정</StyledLink>
        <StyledLink to="/signup">회원가입</StyledLink>
      </LinkContainer>
    </LoginPageContainer>
  );
}

export default LoginPage;