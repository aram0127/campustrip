import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
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

const PrevButton = styled(FooterButton)``;

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

const ImageUploadContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.borderColor};
    border-radius: 3px;
  }
`;

const ImageUploadButton = styled.button`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border: 1px dashed ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 12px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ImagePreviewItem = styled.div`
  position: relative;
  width: 80px;
  height: 80px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  cursor: pointer;
  padding: 0;
`;

const PostCreateDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const { formData, updateFormData } = usePostCreate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 수정 모드인지 확인
  const { postId } = useParams<{ postId?: string }>();
  const isEditMode = !!postId;

  // Context의 데이터로 컴포넌트 내부 상태 초기화
  const [title, setTitle] = useState(formData.title);
  const [body, setBody] = useState(formData.body);
  const [startDate, setStartDate] = useState(formData.startDate || "");
  const [endDate, setEndDate] = useState(formData.endDate || "");
  const [teamSize, setTeamSize] = useState(formData.teamSize);
  const [images, setImages] = useState<File[]>(formData.images);

  // 오늘 날짜 계산 (YYYY-MM-DD 형식)
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(
    today.getMonth() + 1
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  useEffect(() => {
    // 1단계(지역 선택)를 건너뛰고 이 페이지로 바로 온 경우
    if (formData.regions.length === 0) {
      // 수정 모드와 생성 모드에 따라 올바른 경로로 리디렉션
      const path = isEditMode
        ? `/posts/edit/${postId}/region`
        : "/posts/new/region";
      navigate(path, { replace: true });
    }
  }, [formData.regions, navigate, isEditMode, postId]);

  // useEffect가 실행되기 전에 렌더링되는 것을 방지하는 가드
  if (formData.regions.length === 0) {
    return null;
  }

  // 이미지 선택 핸들러
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const availableCount = 5 - images.length;

      if (newFiles.length > availableCount) {
        alert(`사진은 최대 5장까지 업로드할 수 있습니다.`);
        return;
      }

      const updatedImages = [...images, ...newFiles];
      setImages(updatedImages);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // 이미지 삭제 핸들러
  const handleRemoveImage = (index: number) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
  };

  // 인원 수 조절 핸들러 (최소 2명)
  const handleTeamSizeChange = (amount: number) => {
    setTeamSize((prev) => Math.max(2, prev + amount));
  };

  // 폼 유효성 검사: 제목, 본문, 시작일, 종료일이 모두 존재해야 함
  const isFormValid =
    title.trim().length > 0 &&
    body.trim().length > 0 &&
    startDate !== "" &&
    endDate !== "";

  // '이전' 버튼 클릭
  const handlePrev = () => {
    updateFormData({ title, body, startDate, endDate, teamSize, images });
    const path = isEditMode
      ? `/posts/edit/${postId}/region`
      : "/posts/new/region";
    navigate(path); // 1단계로 이동
  };

  // '다음' 버튼 클릭
  const handleNext = () => {
    if (!isFormValid) {
      alert("제목, 본문, 일정을 모두 입력해주세요.");
      return;
    }

    if (startDate && startDate < todayString) {
      alert("여행 시작일은 오늘 날짜 이후여야 합니다.");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      alert("종료일은 시작일보다 빠를 수 없습니다.");
      return;
    }

    updateFormData({ title, body, startDate, endDate, teamSize, images });
    const path = isEditMode
      ? `/posts/edit/${postId}/planner`
      : "/posts/new/planner";
    navigate(path); // 3단계(플래너 선택)로 이동
  };

  return (
    <PageLayout title="새 게시글 작성 (2/3)" showBackButton={false}>
      <ScrollingFormContainer>
        <SelectedRegionsContainer>
          선택한 지역:
          {formData.regions.map((region) => (
            <RegionTag key={region.id}>{region.name}</RegionTag>
          ))}
        </SelectedRegionsContainer>

        <FormGroup>
          <FormLabel>사진 ({images.length}/5)</FormLabel>
          <ImageUploadContainer>
            {images.length < 5 && (
              <ImageUploadButton onClick={() => fileInputRef.current?.click()}>
                <span>+ 추가</span>
              </ImageUploadButton>
            )}
            {images.map((file, index) => (
              <ImagePreviewItem key={index}>
                <PreviewImage
                  src={URL.createObjectURL(file)}
                  alt={`preview-${index}`}
                />
                <RemoveImageButton
                  onClick={() => handleRemoveImage(index)}
                ></RemoveImageButton>
              </ImagePreviewItem>
            ))}
          </ImageUploadContainer>
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleImageChange}
          />
        </FormGroup>

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
              min={todayString}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <FormInput
              type="date"
              value={endDate}
              min={startDate || todayString}
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
