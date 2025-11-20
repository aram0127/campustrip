import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { usePostCreate } from "../../../context/PostCreateContext";
import Button from "../../../components/common/Button";
import PageLayout, {
  ScrollingContent,
} from "../../../components/layout/PageLayout";

const ScrollingFormContainer = styled(ScrollingContent)`
  padding: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 24px;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: bold;
  margin-bottom: 8px;
`;

const FormInput = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const FormTextarea = styled.textarea`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  box-sizing: border-box;
  min-height: 200px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const DateInputs = styled.div`
  display: flex;
  gap: 10px;
`;

const NumberInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const NumberButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
`;

const NumberDisplay = styled.span`
  font-size: 18px;
  font-weight: bold;
  min-width: 40px;
  text-align: center;
`;

const Footer = styled.footer`
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const FooterButton = styled(Button)`
  flex: 1;
  font-size: 16px;
`;

const PrevButton = styled(FooterButton)`
  background-color: ${({ theme }) => theme.colors.secondaryTextColor};
  color: white;

  &:hover {
    background-color: ${({ theme }) => theme.colors.grey};
  }
`;

const SelectedRegionsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const RegionTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 14px;
`;

const PostCreateDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = usePostCreate();

  // Context의 데이터로 컴포넌트 내부 상태 초기화
  const [title, setTitle] = useState(formData.title);
  const [body, setBody] = useState(formData.body);
  const [startDate, setStartDate] = useState(formData.startDate || "");
  const [endDate, setEndDate] = useState(formData.endDate || "");
  const [teamSize, setTeamSize] = useState(formData.teamSize);

  // 1단계(지역 선택)를 건너뛰고 이 페이지로 바로 온 경우, 1단계로 보냄
  if (formData.regions.length === 0) {
    navigate("/posts/new/region", { replace: true });
    return null;
  }

  // 인원 수 조절 핸들러 (최소 2명)
  const handleTeamSizeChange = (amount: number) => {
    setTeamSize((prev) => Math.max(2, prev + amount));
  };

  // 폼 유효성 검사
  const isFormValid = title.trim().length > 0 && body.trim().length > 0;

  // '이전' 버튼 클릭
  const handlePrev = () => {
    // 2단계 데이터를 Context에 임시 저장 (페이지를 떠나기 전)
    updateFormData({ title, body, startDate, endDate, teamSize });
    navigate("/posts/new/region"); // 1단계로 이동
  };

  // '다음' 버튼 클릭
  const handleNext = () => {
    if (!isFormValid) {
      alert("제목과 본문 내용을 입력해주세요.");
      return;
    }
    // 2단계 데이터를 Context에 저장
    updateFormData({ title, body, startDate, endDate, teamSize });
    // 3단계(플래너 선택)로 이동
    navigate("/posts/new/planner");
  };

  return (
    <PageLayout title="새 게시글 작성 (2/3)">
      <ScrollingFormContainer>
        <SelectedRegionsContainer>
          선택한 지역:
          {formData.regions.map((region) => (
            <RegionTag key={region.id}>{region.name}</RegionTag>
          ))}
        </SelectedRegionsContainer>

        <FormGroup>
          <FormLabel htmlFor="title">제목</FormLabel>
          <FormInput
            type="text"
            id="title"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="content">본문</FormLabel>
          <FormTextarea
            id="content"
            placeholder="여행에 대한 상세한 내용을 작성해주세요."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </FormGroup>

        <FormGroup>
          <FormLabel>일정</FormLabel>
          <DateInputs>
            <FormInput
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </DateInputs>
        </FormGroup>

        <FormGroup>
          <FormLabel>모집 인원 (본인 포함)</FormLabel>
          <NumberInputContainer>
            <NumberButton onClick={() => handleTeamSizeChange(-1)}>
              -
            </NumberButton>
            <NumberDisplay>{teamSize}명</NumberDisplay>
            <NumberButton onClick={() => handleTeamSizeChange(1)}>
              +
            </NumberButton>
          </NumberInputContainer>
        </FormGroup>
      </ScrollingFormContainer>

      <Footer>
        <PrevButton onClick={handlePrev}>이전</PrevButton>
        <FooterButton onClick={handleNext} disabled={!isFormValid}>
          다음
        </FooterButton>
      </Footer>
    </PageLayout>
  );
};

export default PostCreateDetailsPage;
