import React, { useEffect } from "react";
import styled, { keyframes, css } from "styled-components";
import { IoNotifications, IoClose } from "react-icons/io5";

// 애니메이션 정의
const slideDown = keyframes`
  from { transform: translate(-50%, -100%); opacity: 0; }
  to { transform: translate(-50%, 20px); opacity: 1; }
`;

const fadeOut = keyframes`
  from { transform: translate(-50%, 20px); opacity: 1; }
  to { transform: translate(-50%, -100%); opacity: 0; }
`;

const ToastContainer = styled.div<{ $isVisible: boolean }>`
  position: fixed;
  top: 0;
  left: 50%;
  z-index: 9999;

  display: flex;
  align-items: flex-start;
  gap: 12px;

  min-width: 320px;
  max-width: 90%;
  padding: 16px;

  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-left: 4px solid ${({ theme }) => theme.colors.primary};
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);

  /* 애니메이션 적용 */
  animation: ${({ $isVisible }) =>
    $isVisible
      ? css`
          ${slideDown} 0.4s ease-out forwards
        `
      : css`
          ${fadeOut} 0.4s ease-in forwards
        `};
`;

const IconWrapper = styled.div`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  display: flex;
  align-items: center;
  margin-top: 2px;
`;

const Content = styled.div`
  flex: 1;
`;

const Title = styled.h4`
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

const Body = styled.p`
  margin: 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  line-height: 1.4;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: ${({ theme }) => theme.colors.grey};
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

interface ToastProps {
  title: string;
  body: string;
  isVisible: boolean;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ title, body, isVisible, onClose }) => {
  // 3초 후 자동으로 닫히도록 설정
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  // 화면에서 완전히 사라질 때까지 렌더링 유지
  if (!isVisible && !title) return null;

  return (
    <ToastContainer $isVisible={isVisible}>
      <IconWrapper>
        <IoNotifications />
      </IconWrapper>
      <Content>
        <Title>{title}</Title>
        <Body>{body}</Body>
      </Content>
      <CloseButton onClick={onClose}>
        <IoClose />
      </CloseButton>
    </ToastContainer>
  );
};

export default Toast;
