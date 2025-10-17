import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignupPageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;

  padding: 40px 20px;
`;

const Title = styled.h1`
  font-size: ${({ theme }) => theme.fontSizes.title};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  margin-bottom: 24px;
`;

const Form = styled.form`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
`;

const InputWithButtonContainer = styled.div`
  display: flex;
  width: 100%;
  gap: 8px;
`;

// 유효성 검사 메시지를 보여줄 컴포넌트
const ValidationMessage = styled.p<{ isValid: boolean }>`
  font-size: 12px;
  color: ${({ theme, isValid }) =>
    isValid ? theme.colors.secondary : theme.colors.error};
  margin: -8px 0 8px 0;
  width: 100%;
  max-width: 300px;
  text-align: left;
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function SignupPage() {
  const navigate = useNavigate();

  // 입력값 상태 관리
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // 유효성 검사 상태 관리
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [userIdMessage, setUserIdMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSchoolEmailValid, setIsSchoolEmailValid] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);

  // 인증코드 입력창 표시 여부
  const [showSchoolEmailVerification, setShowSchoolEmailVerification] =
    useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  // API 호출 로딩 및 에러 상태
  const [error, setError] = useState("");

  // 아이디 유효성 검사
  useEffect(() => {
    const userIdRegex = /^[a-zA-Z0-9]{5,10}$/;
    if (userId && !userIdRegex.test(userId)) {
      setUserIdMessage("5~10자의 영문 또는 숫자만 입력 가능합니다.");
      setIsUserIdValid(false);
    } else if (userId) {
      setUserIdMessage("사용 가능한 아이디입니다.");
      setIsUserIdValid(true);
    } else {
      setUserIdMessage("");
    }
  }, [userId]);

  // 비밀번호 유효성 검사
  useEffect(() => {
    const passwordRegex =
      /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?])[a-zA-Z\d!@#$%^&*?]{8,20}$/;
    if (password && !passwordRegex.test(password)) {
      setPasswordMessage("8~20자, 영문, 숫자, 특수문자를 포함해야 합니다.");
      setIsPasswordValid(false);
    } else if (password) {
      setPasswordMessage("안전한 비밀번호입니다.");
      setIsPasswordValid(true);
    } else {
      setPasswordMessage("");
    }
  }, [password]);

  // 이메일 유효성 검사
  useEffect(() => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    setIsSchoolEmailValid(emailRegex.test(schoolEmail));
  }, [schoolEmail]);

  // 전화번호 유효성 검사
  useEffect(() => {
    const phoneRegex = /^010\d{8}$/;
    setIsPhoneNumberValid(phoneRegex.test(phoneNumber));
  }, [phoneNumber]);

  // 모든 폼 필드가 유효한지 확인 (임시 로직)
  const isFormValid =
    isUserIdValid &&
    isPasswordValid &&
    name &&
    isSchoolEmailValid &&
    isPhoneNumberValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("입력 정보를 다시 확인해주세요.");
      return;
    }

    try {
      const userData = {
        userId: userId,
        password: password,
        name: name,
        schoolEmail: schoolEmail,
        phoneNumber: phoneNumber,
        email: schoolEmail,
      };

      // 백엔드 API 호출
      await axios.post(`${API_BASE_URL}/api/users`, userData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    } catch (err) {
      console.error("회원가입 실패:", err);
      if (axios.isAxiosError(err) && err.response) {
        setError(`회원가입 실패 (${err.response.status}): ${err.message}`);
      } else {
        setError(
          "회원가입 중 오류가 발생했습니다. 네트워크 연결을 확인하거나 잠시 후 다시 시도해주세요."
        );
      }
      alert(error);
    }
  };

  return (
    <SignupPageContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
        {userIdMessage && (
          <ValidationMessage isValid={isUserIdValid}>
            {userIdMessage}
          </ValidationMessage>
        )}

        <Input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={20}
          required
        />
        {passwordMessage && (
          <ValidationMessage isValid={isPasswordValid}>
            {passwordMessage}
          </ValidationMessage>
        )}

        <Input
          type="text"
          placeholder="이름"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <InputWithButtonContainer>
          <Input
            type="email"
            placeholder="대학교 이메일"
            style={{ flex: 1 }}
            value={schoolEmail}
            onChange={(e) => setSchoolEmail(e.target.value)}
            required
          />
          <Button
            type="button"
            onClick={() => setShowSchoolEmailVerification(true)}
            disabled={!isSchoolEmailValid}
            style={{ width: "120px", padding: "12px 0" }}
          >
            인증코드 받기
          </Button>
        </InputWithButtonContainer>
        {showSchoolEmailVerification && (
          <InputWithButtonContainer>
            <Input
              type="text"
              placeholder="인증코드"
              style={{ flex: 1 }}
              required
            />
            <Button type="button" style={{ width: "120px", padding: "12px 0" }}>
              인증코드 확인
            </Button>
          </InputWithButtonContainer>
        )}

        <InputWithButtonContainer>
          <Input
            type="tel"
            placeholder="휴대폰 번호 ('-' 제외)"
            style={{ flex: 1 }}
            value={phoneNumber}
            onChange={(e) => {
              const cleanedPhone = e.target.value.replace(/[^0-9]/g, "");
              setPhoneNumber(cleanedPhone);
            }}
            required
          />
          <Button
            type="button"
            onClick={() => setShowPhoneVerification(true)}
            disabled={!isPhoneNumberValid}
            style={{ width: "120px", padding: "12px 0" }}
          >
            인증코드 받기
          </Button>
        </InputWithButtonContainer>
        {showPhoneVerification && (
          <InputWithButtonContainer>
            <Input
              type="text"
              placeholder="인증코드"
              style={{ flex: 1 }}
              required
            />
            <Button type="button" style={{ width: "120px", padding: "12px 0" }}>
              인증코드 확인
            </Button>
          </InputWithButtonContainer>
        )}

        {error && (
          <ValidationMessage isValid={false}>{error}</ValidationMessage>
        )}

        <Button
          size="large"
          type="submit"
          disabled={!isFormValid}
          style={{
            width: "100%",
            marginTop: "24px",
          }}
        >
          가입하기
        </Button>
      </Form>
    </SignupPageContainer>
  );
}

export default SignupPage;
