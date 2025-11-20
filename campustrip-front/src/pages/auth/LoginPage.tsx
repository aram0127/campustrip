import React, { useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../api/auth";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import Checkbox from "../../components/common/Checkbox";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/layout/AuthLayout";

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

function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    mutate: performLogin, // mutate 함수를 performLogin으로 이름 변경
    error, // 에러 상태
  } = useMutation({
    mutationFn: loginUser, // API 함수 연결
    onSuccess: (data) => {
      // 성공 시 로직 (API 호출 성공 후 실행됨)
      const { token } = data;
      login(token); // AuthContext의 login 함수 실행
      alert("로그인에 성공했습니다.");
      navigate("/posts"); // 메인 페이지로 이동
    },
    onError: (err) => {
      // 에러 시 로직 (네트워크 오류, 401 등)
      // loginUser 함수에서 던진 에러나 axios 에러가 여기에 잡힘
      console.error("로그인 실패:", err);
      // 에러 메시지는 error 객체를 통해 자동으로 ErrorMessage 컴포넌트에 표시됨
    },
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", userId);
    formData.append("password", password);

    performLogin(formData);
  };

  return (
    <AuthLayout title="Campus Trip">
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
        <ErrorMessage>
          {error ? "아이디 또는 비밀번호가 올바르지 않습니다." : ""}
        </ErrorMessage>
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
    </AuthLayout>
  );
}

export default LoginPage;
