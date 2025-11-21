import axios from "axios";
import { type User } from "../types/user";

// API 기본 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 로그인 응답 타입 (헤더에서 토큰을 받음)
interface LoginResponse {
  token: string;
}

/* 로그인 요청 */
export const loginUser = async (formData: FormData): Promise<LoginResponse> => {
  const response = await axios.post(`${API_BASE_URL}/login`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const token = response.headers["authorization"];
  if (!token) {
    throw new Error("로그인에 실패했습니다: 토큰이 없습니다.");
  }
  return { token };
};

// 회원가입 요청 타입
interface SignupData {
  userId: string;
  password: string;
  name: string;
  schoolEmail: string;
  phoneNumber: string;
  universityName: string;
}

/* 회원가입을 요청 */
export const signupUser = async (userData: SignupData): Promise<User> => {
  const response = await axios.post<User>(
    `${API_BASE_URL}/api/users`,
    userData,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
  return response.data;
};

/* 이메일 인증 코드 발송 */
export const sendEmailVerification = async (email: string): Promise<void> => {
  await axios.post(`${API_BASE_URL}/api/auth/email/send`, { email });
};

/* 이메일 인증 코드 검증 응답 타입 */
interface VerifyResponse {
  verified: boolean;
  universityName: string | null;
}

/* 이메일 인증 코드 검증 */
export const verifyEmailVerification = async (
  email: string,
  code: string
): Promise<string> => {
  const response = await axios.post<VerifyResponse>(
    `${API_BASE_URL}/api/auth/email/verify`,
    { email, code }
  );

  if (!response.data.verified || !response.data.universityName) {
    throw new Error("인증에 실패했거나 대학교 정보를 찾을 수 없습니다.");
  }

  return response.data.universityName;
};
