import React from "react";
import styled from "styled-components";
import { IoAdd } from "react-icons/io5";

const FABContainer = styled.button`
  position: fixed;
  right: ${({ theme }) => theme.spacings.medium}; /* 16px (20px에서 조정) */
  bottom: calc(60px + ${({ theme }) => theme.spacings.medium});
  width: 56px;
  height: 56px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  border: none;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  z-index: 10;
  transition: transform 0.2s ease-in-out;
  padding: 0;

  &:hover {
    transform: scale(1.05);
  }

  & > svg {
    width: ${({ theme }) => theme.spacings.xlarge}; /* 32px */
    height: ${({ theme }) => theme.spacings.xlarge}; /* 32px */
  }
`;

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
}) => {
  return (
    <FABContainer onClick={onClick}>
      <IoAdd />
    </FABContainer>
  );
};

export default FloatingActionButton;
