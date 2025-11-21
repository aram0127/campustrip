import React, { useState, useEffect } from "react";
import styled from "styled-components";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import {
  signupUser,
  sendEmailVerification,
  verifyEmailVerification,
} from "../../api/auth";
import AuthLayout from "../../components/layout/AuthLayout";

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
  text-align: left;
`;

function SignupPage() {
  const navigate = useNavigate();

  // 입력값 상태
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [schoolEmail, setSchoolEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [universityName, setUniversityName] = useState("");

  // 유효성 검사 상태
  const [isUserIdValid, setIsUserIdValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [userIdMessage, setUserIdMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [isSchoolEmailValid, setIsSchoolEmailValid] = useState(false);
  const [isPhoneNumberValid, setIsPhoneNumberValid] = useState(false);

  // 인증 절차 상태
  const [emailCodeSent, setEmailCodeSent] = useState(false);
  const [phoneCodeSent, setPhoneCodeSent] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [isPhoneLoading, setIsPhoneLoading] = useState(false);
  const [timer, setTimer] = useState(0);

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

  // 타이머 카운트다운 효과
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // 인증코드 발송 함수 (이메일)
  const handleSendEmailCode = async () => {
    setIsEmailLoading(true);
    try {
      await sendEmailVerification(schoolEmail);
      alert("이메일로 인증코드가 발송되었습니다.");
      setEmailCodeSent(true);
      setTimer(60);
    } catch (err) {
      console.error(err);
      alert("인증코드 발송에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // 인증코드 검증 함수 (이메일)
  const handleVerifyEmailCode = async () => {
    setIsEmailLoading(true);
    try {
      const verifiedUnivName = await verifyEmailVerification(
        schoolEmail,
        emailCode
      );
      setUniversityName(verifiedUnivName);
      alert("이메일 인증이 완료되었습니다.");
      setIsEmailVerified(true);
    } catch (err) {
      console.error(err);
      alert("인증코드가 올바르지 않거나 대학교 정보를 찾을 수 없습니다.");
    } finally {
      setIsEmailLoading(false);
    }
  };

  // 인증코드 발송 함수 (휴대폰)
  const handleSendSmsCode = async () => {
    setIsPhoneLoading(true);
    try {
      // TODO: 백엔드에 SMS 인증 코드 발송 API 호출
      alert("휴대폰으로 인증코드가 발송되었습니다.");
      setPhoneCodeSent(true);
    } catch (err) {
      alert("인증코드 발송에 실패했습니다.");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  // -인증코드 검증 함수 (휴대폰)
  const handleVerifySmsCode = async () => {
    setIsPhoneLoading(true);
    try {
      // TODO: 백엔드에 SMS 인증 코드 검증 API 호출
      alert("휴대폰 인증에 성공했습니다.");
      setIsPhoneVerified(true);
    } catch (err) {
      alert("인증코드가 올바르지 않습니다.");
    } finally {
      setIsPhoneLoading(false);
    }
  };

  // 폼 유효성 검사
  const isFormValid =
    isUserIdValid &&
    isPasswordValid &&
    name &&
    isSchoolEmailValid &&
    isPhoneNumberValid &&
    isEmailVerified &&
    isPhoneVerified &&
    universityName;

  const {
    mutate: performSignup,
    isPending, // 로딩 상태
    error, // 에러 상태
  } = useMutation({
    mutationFn: signupUser, // auth.ts에 정의한 API 함수 연결
    onSuccess: () => {
      // 성공 시 로직
      alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
      navigate("/login");
    },
    onError: (err) => {
      // 실패 시 로직
      console.error("회원가입 실패:", err);
      // 에러 메시지는 error 객체를 통해 자동으로 ValidationMessage에 표시됨
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) {
      alert("모든 인증 절차를 완료해주세요.");
      return;
    }

    // API로 보낼 데이터 준비
    const userData = {
      userId: userId,
      password: password,
      name: name,
      schoolEmail: schoolEmail,
      phoneNumber: phoneNumber,
      email: schoolEmail,
      universityName: universityName,
    };

    // useMutation의 mutate 함수(performSignup) 호출
    performSignup(userData);
  };

  return (
    <AuthLayout title="회원가입">
      <Form onSubmit={handleSubmit}>
        {/* 아이디, 비밀번호, 이름 Input 필드 */}
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

        {/* 이메일 인증 섹션 */}
        <InputWithButtonContainer>
          <Input
            type="email"
            placeholder="대학교 이메일"
            style={{ flex: 1 }}
            value={schoolEmail}
            onChange={(e) => setSchoolEmail(e.target.value)}
            required
            disabled={isEmailVerified}
          />
          <Button
            type="button"
            onClick={handleSendEmailCode}
            disabled={
              !isSchoolEmailValid ||
              isEmailLoading ||
              isEmailVerified ||
              timer > 0
            }
            style={{ width: "120px", padding: "12px 0" }}
          >
            {isEmailLoading
              ? "전송중..."
              : isEmailVerified
              ? "인증완료"
              : timer > 0
              ? `${timer}초`
              : emailCodeSent
              ? "재전송"
              : "인증코드 받기"}
          </Button>
        </InputWithButtonContainer>
        {emailCodeSent && !isEmailVerified && (
          <InputWithButtonContainer>
            <Input
              type="text"
              placeholder="인증코드"
              style={{ flex: 1 }}
              value={emailCode}
              onChange={(e) => setEmailCode(e.target.value)}
              required
            />
            <Button
              type="button"
              onClick={handleVerifyEmailCode}
              disabled={isEmailLoading}
              style={{ width: "120px", padding: "12px 0" }}
            >
              {isEmailLoading ? "확인중..." : "인증코드 확인"}
            </Button>
          </InputWithButtonContainer>
        )}

        {isEmailVerified && universityName && (
          <Input
            type="text"
            value={universityName}
            disabled
            style={{
              cursor: "default",
            }}
          />
        )}

        {/* 인증 완료 메시지 */}
        {isEmailVerified && (
          <ValidationMessage isValid={true}>
            이메일 인증이 완료되었습니다.
          </ValidationMessage>
        )}

        {/* 휴대폰 인증 섹션 */}
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
            disabled={isPhoneVerified}
          />
          <Button
            type="button"
            onClick={handleSendSmsCode}
            disabled={!isPhoneNumberValid || phoneCodeSent || isPhoneVerified}
            style={{ width: "120px", padding: "12px 0" }}
          >
            {isPhoneLoading
              ? "전송중..."
              : phoneCodeSent
              ? "재전송"
              : "인증코드 받기"}
          </Button>
        </InputWithButtonContainer>
        {phoneCodeSent && !isPhoneVerified && (
          <InputWithButtonContainer>
            <Input
              type="text"
              placeholder="인증코드"
              style={{ flex: 1 }}
              value={phoneCode}
              onChange={(e) => setPhoneCode(e.target.value)}
              required
            />
            <Button
              type="button"
              onClick={handleVerifySmsCode}
              disabled={isPhoneLoading}
              style={{ width: "120px", padding: "12px 0" }}
            >
              {isPhoneLoading ? "확인중..." : "인증코드 확인"}
            </Button>
          </InputWithButtonContainer>
        )}
        {isPhoneVerified && (
          <ValidationMessage isValid={true}>
            휴대폰 인증이 완료되었습니다.
          </ValidationMessage>
        )}

        {/* useMutation의 error 객체를 사용하여 에러 메시지 표시 */}
        {error && (
          <ValidationMessage isValid={false}>
            {axios.isAxiosError(error)
              ? `회원가입 실패 (${error.response?.status}): ${error.message}`
              : "회원가입 중 오류가 발생했습니다."}
          </ValidationMessage>
        )}

        <Button
          $size="large"
          type="submit"
          // isFormValid와 isPending 상태로 disabled 관리
          disabled={!isFormValid || isPending}
          style={{
            width: "100%",
            marginTop: "24px",
          }}
        >
          {/* isPending 상태에 따라 버튼 텍스트 변경 */}
          {isPending ? "가입 처리 중..." : "가입하기"}
        </Button>
      </Form>
    </AuthLayout>
  );
}

export default SignupPage;
