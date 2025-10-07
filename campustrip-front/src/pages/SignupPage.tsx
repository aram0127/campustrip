import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useNavigate } from 'react-router-dom';

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
  color: ${({ theme, isValid }) => (isValid ? theme.colors.secondary : theme.colors.error)};
  margin: -8px 0 8px 0;
  width: 100%;
  max-width: 300px;
  text-align: left;
`;

function SignupPage() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) {
      // 실제로는 여기서 회원가입 API 호출 후, 성공 시 토큰을 받아 저장
      alert('회원가입이 완료되었습니다.');
      // 회원가입 성공 후 '/posts' 경로로 이동
      navigate('/posts');
    }
  };

  // 각 입력값과 유효성 상태를 관리할 state들
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  
  const [isIdValid, setIsIdValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [idMessage, setIdMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPhoneValid, setIsPhoneValid] = useState(false);

  // 인증코드 입력창의 표시 여부를 관리할 state
  const [showEmailVerification, setShowEmailVerification] = useState(false);
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);

  // 아이디 유효성 검사 (입력값이 바뀔 때마다 실행)
  useEffect(() => {
    // 5~10자리 영문, 숫자 조합
    const idRegex = /^[a-zA-Z0-9]{5,10}$/;
    if (id && !idRegex.test(id)) {
      setIdMessage('5~10자의 영문 또는 숫자만 입력 가능합니다.');
      setIsIdValid(false);
    } else if (id) {
      // (나중에 추가) 여기서 서버에 중복 확인 API 요청
      // 예: if (isDuplicate(id)) { setIdMessage('이미 사용중인 아이디입니다.'); }
      setIdMessage('사용 가능한 아이디입니다.');
      setIsIdValid(true);
    } else {
      setIdMessage('');
    }
  }, [id]);

  // 비밀번호 유효성 검사 (입력값이 바뀔 때마다 실행)
  useEffect(() => {
    // 8~20자리, 영문, 숫자, 특수문자 포함
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*?])[a-zA-Z\d!@#$%^&*?]{8,20}$/;
    if (password && !passwordRegex.test(password)) {
      setPasswordMessage('8~20자, 영문, 숫자, 특수문자를 포함해야 합니다.');
      setIsPasswordValid(false);
    } else if (password) {
      setPasswordMessage('안전한 비밀번호입니다.');
      setIsPasswordValid(true);
    } else {
      setPasswordMessage('');
    }
  }, [password]);

  // 이메일 유효성 검사 (프론트엔드)
  useEffect(() => {
    // 일반적인 이메일 형식인지 확인
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // 전화번호 유효성 검사
  useEffect(() => {
    const phoneRegex = /^010\d{8}$/;
    setIsPhoneValid(phoneRegex.test(phone));
  }, [phone]);

  // 모든 조건이 유효할 때만 가입하기 버튼 활성화 (임시 로직)
  const isFormValid = isIdValid && isPasswordValid && isEmailValid && isPhoneValid; // 나중에 인증 상태도 추가

  return (
    <SignupPageContainer>
      <Title>회원가입</Title>
      <Form onSubmit={handleSubmit}>
        <Input 
          type="text" 
          placeholder="아이디" 
          value={id} 
          onChange={(e) => setId(e.target.value)} 
          required 
        />
        {idMessage && <ValidationMessage isValid={isIdValid}>{idMessage}</ValidationMessage>}

        <Input 
          type="password" 
          placeholder="비밀번호" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          maxLength={20}
          required 
        />
        {passwordMessage && <ValidationMessage isValid={isPasswordValid}>{passwordMessage}</ValidationMessage>}
        
        <Input type="text" placeholder="이름" required />
        
        <InputWithButtonContainer>
          <Input 
            type="email" 
            placeholder="대학교 이메일" 
            style={{ flex: 1 }} 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
          {/* 이메일이 유효할 때만 버튼 활성화 */}
          <Button 
            type="button" 
            onClick={() => setShowEmailVerification(true)} 
            disabled={!isEmailValid}
            style={{ width: '120px', padding: '12px 0' }}
          >
            인증코드 받기
          </Button>
        </InputWithButtonContainer>
        {/* showEmailVerification이 true일 때만 렌더링 */}
        {showEmailVerification && (
          <InputWithButtonContainer>
            <Input type="text" placeholder="인증코드" style={{ flex: 1 }} required />
            <Button type="button" style={{ width: '120px', padding: '12px 0' }}>인증코드 확인</Button>
          </InputWithButtonContainer>
        )}

        <InputWithButtonContainer>
          <Input 
            type="tel" 
            placeholder="휴대폰 번호"
            style={{ flex: 1 }} 
            value={phone}
            onChange={(e) => {
              const cleanedPhone = e.target.value.replace(/[^0-9]/g, '');
              setPhone(cleanedPhone);
            }}
            required 
          />
          <Button 
            type="button" 
            onClick={() => setShowPhoneVerification(true)} 
            disabled={!isPhoneValid}
            style={{ width: '120px', padding: '12px 0' }}
          >
            인증코드 받기
          </Button>
        </InputWithButtonContainer>
        {showPhoneVerification && (
          <InputWithButtonContainer>
            <Input type="text" placeholder="인증코드" style={{ flex: 1 }} required />
            <Button type="button" style={{ width: '120px', padding: '12px 0' }}>인증코드 확인</Button>
          </InputWithButtonContainer>
        )}

        {/* isFormValid가 false이면 버튼 비활성화 */}
        <Button 
          size="large" 
          type="submit" 
          disabled={!isFormValid} 
          style={{ 
            width: '100%',
            marginTop: '24px' 
          }}
        >
          가입하기
        </Button>
      </Form>
    </SignupPageContainer>
  );
}

export default SignupPage;