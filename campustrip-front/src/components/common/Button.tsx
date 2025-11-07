import styled, { css } from "styled-components";

interface ButtonProps {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "large" | "medium" | "small";
  disabled?: boolean;
}

const Button = styled.button<ButtonProps>`
  /* 공통 스타일 */
  cursor: pointer;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  transition: background-color 0.2s ease-in-out;

  /* 사이즈 variants */
  ${({ size = "medium" }) =>
    size === "large" &&
    css`
      padding: 14px 24px;
      font-size: ${({ theme }) => theme.fontSizes.body};
    `}

  /* 디자인 variants */
  ${({ variant = "primary", theme }) =>
    variant === "primary" &&
    css`
      background-color: ${theme.colors.primary};
      color: white;
      &:hover {
        background-color: #218838;
      }
    `}

  ${({ variant, theme }) =>
    variant === "outline" &&
    css`
      background-color: transparent;
      border: 1px solid ${theme.colors.primary};
      color: ${theme.colors.primary};
      &:hover {
        background-color: rgba(0, 122, 255, 0.1); /* 살짝 배경색 추가 */
      }
    `}

  ${({ variant, theme }) =>
    variant === "danger" &&
    css`
      background-color: ${theme.colors.error};
      color: white;
      &:hover {
        background-color: #c82333; // (예시)
      }
    `}

  /* 비활성화 상태 */
  &:disabled {
    background-color: ${({ theme }) => theme.colors.grey};
    cursor: not-allowed;
  }
`;

export default Button;
