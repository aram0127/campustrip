import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import AuthLayout from "../../components/layout/AuthLayout";

const Form = styled.form`
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PasswordRequirement = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: -4px 0 8px 0;
  width: 100%;
`;

function SetNewPasswordPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 실제로는 여기서 새 비밀번호를 저장하는 API 호출
    alert("비밀번호가 변경되었습니다.");
    navigate("/login");
  };

  return (
    <AuthLayout
      title="새 비밀번호 설정"
      subtitle="새롭게 사용하실 비밀번호를 입력해주세요."
    >
      <Form onSubmit={handleSubmit}>
        <Input type="password" placeholder="새 비밀번호" required />
        <Input type="password" placeholder="새 비밀번호 확인" required />
        <PasswordRequirement>
          8자 이상, 영문/숫자/특수문자 조합
        </PasswordRequirement>
        <Button size="large" type="submit" style={{ width: "100%" }}>
          비밀번호 변경
        </Button>
      </Form>
    </AuthLayout>
  );
}

export default SetNewPasswordPage;
