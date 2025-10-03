import React from 'react';
import styled from 'styled-components';
import { IoAdd } from 'react-icons/io5';

const FABContainer = styled.button`
  position: fixed;
  right: 20px;
  bottom: 80px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
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
    width: 32px;
    height: 32px;
  }
`;

interface FloatingActionButtonProps {
  onClick: () => void;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onClick }) => {
  return (
    <FABContainer onClick={onClick}>
      <IoAdd />
    </FABContainer>
  );
};

export default FloatingActionButton;