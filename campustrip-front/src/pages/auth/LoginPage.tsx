import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Checkbox from "../../components/common/Checkbox";
import { useAuth } from "../../context/AuthContext";

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

const ErrorMessage = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
  margin-top: 8px;
  text-align: center;
  min-height: 18px;
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const formData = new FormData();
    formData.append("username", userId);
    formData.append("password", password);

    try {
      const response = await axios.post(`${API_BASE_URL}/login`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      const token = response.headers["authorization"];

      if (token) {
        login(token);
        alert("로그인에 성공했습니다.");
        navigate("/posts");
      } else {
        setError("로그인에 실패했습니다.");
      }
    } catch (err) {
      console.error("로그인 실패:", err);
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        setError("아이디 또는 비밀번호가 올바르지 않습니다.");
      } else {
        setError("로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      }
    }
  };

  return (
    <LoginPageContainer>
      <Title>Campus Trip</Title>
      <Form onSubmit={handleLogin}>
        <Input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
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
        <ErrorMessage>{error}</ErrorMessage>
        <Button
          size="large"
          type="submit"
          style={{ marginTop: "8px", width: "100%" }}
        >
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
