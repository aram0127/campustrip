import React, { useState } from 'react';
import styled from 'styled-components';
import { AiFillEye, AiFillEyeInvisible } from 'react-icons/ai';

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  font-size: ${({ theme }) => theme.fontSizes.body};
  box-sizing: border-box;

  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }
`;

// 비밀번호 토글 버튼 스타일
const ToggleButton = styled.button`
  position: absolute;
  right: 0px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.grey};
  display: flex;
  align-items: center;
`;

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input: React.FC<InputProps> = (props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // type이 'password'일 때만 토글 기능 활성화
  if (props.type === 'password') {
    return (
      <InputContainer>
        <StyledInput {...props} type={isPasswordVisible ? 'text' : 'password'} />
        <ToggleButton type="button" onClick={togglePasswordVisibility}>
          {isPasswordVisible ? <AiFillEyeInvisible /> : <AiFillEye />}
        </ToggleButton>
      </InputContainer>
    );
  }

  return <StyledInput {...props} />;
};

export default Input;