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
import { jwtDecode } from "jwt-decode";
import { requestFcmToken } from "../../firebase";
import { registerFcmToken } from "../../api/fcm";

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

interface DecodedToken {
  username: string; // User의 userId
  membershipId: number; // User의 membership_id
  name: string; // User의 name
  role: string;
  iat: number;
  exp: number;
}

function LoginPage() {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const { mutate: performLogin, error } = useMutation({
    mutationFn: loginUser,
    onSuccess: async (data) => {
      const { token } = data;
      login(token);

      // 로그인 성공 시 FCM 토큰 발급 및 서버 전송
      try {
        // 토큰에서 membershipId 추출
        const decoded = jwtDecode<DecodedToken>(token);
        const membershipId = decoded.membershipId;

        // FCM 토큰 발급 요청
        const fcmToken = await requestFcmToken();

        // 서버에 토큰 등록
        if (fcmToken && membershipId) {
          await registerFcmToken(membershipId, fcmToken);
          console.log("FCM 토큰 등록 완료");
        }
      } catch (err) {
        console.error("FCM 토큰 등록 중 오류 발생:", err);
      }

      alert("로그인에 성공했습니다.");
      navigate("/posts");
    },
    onError: (err) => {
      console.error("로그인 실패:", err);
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
          $size="large"
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
