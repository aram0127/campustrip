import React, {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";

// 3단계에 걸쳐 수집할 데이터 타입 정의
interface PostCreateData {
  region: string | null; // 1단계: 지역
  title: string; // 2단계: 제목
  body: string; // 2단계: 본문
  startDate: string | null; // 2단계: 시작일
  endDate: string | null; // 2단계: 종료일
  teamSize: number; // 2단계: 인원
  plannerId: number | null; // 3단계: 플래너 ID
}

// Context가 제공할 값들의 타입 정의
interface PostCreateContextType {
  formData: PostCreateData;
  // 폼 데이터를 부분적으로 업데이트하는 함수
  updateFormData: (data: Partial<PostCreateData>) => void;
  // 폼 데이터를 초기화하는 함수
  resetFormData: () => void;
}

// 초기 폼 데이터
const initialData: PostCreateData = {
  region: null,
  title: "",
  body: "",
  startDate: null,
  endDate: null,
  teamSize: 2, // 기본값 2명
  plannerId: null,
};

// Context 생성
const PostCreateContext = createContext<PostCreateContextType | undefined>(
  undefined
);

// Provider 컴포넌트 생성
export const PostCreateProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [formData, setFormData] = useState<PostCreateData>(initialData);

  const updateFormData = (data: Partial<PostCreateData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const resetFormData = () => {
    setFormData(initialData);
  };

  return (
    <PostCreateContext.Provider
      value={{ formData, updateFormData, resetFormData }}
    >
      {children}
    </PostCreateContext.Provider>
  );
};

// Context를 쉽게 사용하기 위한 커스텀 훅
export const usePostCreate = () => {
  const context = useContext(PostCreateContext);
  if (!context) {
    throw new Error("usePostCreate must be used within a PostCreateProvider");
  }
  return context;
};
