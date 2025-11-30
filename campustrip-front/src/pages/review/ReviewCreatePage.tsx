import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyApplications } from "../../api/applications";
import { getPostsByUserId } from "../../api/posts";
import { createReview } from "../../api/reviews";
import { type Post } from "../../types/post";
import Button from "../../components/common/Button";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";

const FormContainer = styled(ScrollingContent)`
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

const FormSelect = styled.select`
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
  min-height: 250px;
  resize: vertical;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const ImageUploadContainer = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 8px;

  /* 스크롤바 스타일 */
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

const SubmitButtonContainer = styled.div`
  padding: 10px 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const SubmitButton = styled(Button)`
  width: 100%;
  font-size: 16px;
`;

const ReviewCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [selectedPostId, setSelectedPostId] = useState<number | "">("");
  const [images, setImages] = useState<File[]>([]);
  const [myTrips, setMyTrips] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);

  // 참여했던 여행 목록 불러오기
  useEffect(() => {
    if (user) {
      fetchMyTrips();
    }
  }, [user]);

  const fetchMyTrips = async () => {
    try {
      if (!user) return;

      const [applications, myHostedPosts] = await Promise.all([
        getMyApplications(user.id),
        getPostsByUserId(user.id),
      ]);

      const acceptedTrips = applications
        .filter((app) => app.applicationStatus === true)
        .map((app) => app.post);

      const allTrips = [...myHostedPosts, ...acceptedTrips];

      const uniqueTrips = Array.from(
        new Map(allTrips.map((trip) => [trip.postId, trip])).values()
      );

      uniqueTrips.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setMyTrips(uniqueTrips);
    } catch (error) {
      console.error("여행 목록 로드 실패", error);
    }
  };

  // 이미지 업로드 핸들러 (최대 20장)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const MAX_IMAGES = 20;
      const availableCount = MAX_IMAGES - images.length;

      if (newFiles.length > availableCount) {
        alert(`사진은 최대 ${MAX_IMAGES}장까지 업로드할 수 있습니다.`);
        return;
      }

      setImages((prev) => [...prev, ...newFiles]);
    }
    // 같은 파일 다시 선택 가능하도록 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // 제출 핸들러
  const handleSubmit = async () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return;
    }
    if (!selectedPostId) {
      alert("후기를 작성할 여행을 선택해주세요.");
      return;
    }
    if (!title.trim() || !body.trim()) {
      alert("제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setLoading(true);
      await createReview({
        userId: user.id,
        postId: Number(selectedPostId),
        title,
        body,
        images,
      });
      alert("후기가 성공적으로 등록되었습니다!");
      navigate("/reviews"); // 목록 페이지로 이동
    } catch (error) {
      console.error("후기 생성 실패", error);
      alert("후기 등록 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 유효성 검사 (버튼 활성화용)
  const isValid =
    title.trim() !== "" && body.trim() !== "" && selectedPostId !== "";

  return (
    <PageLayout title="후기 작성" showBackButton={true}>
      <FormContainer>
        {/* 여행 선택 */}
        <FormGroup>
          <FormLabel>다녀온 여행 선택</FormLabel>
          <FormSelect
            value={selectedPostId}
            onChange={(e) => setSelectedPostId(Number(e.target.value))}
            disabled={myTrips.length === 0}
          >
            <option value="" disabled>
              {myTrips.length === 0
                ? "작성 가능한 여행 내역이 없습니다."
                : "여행을 선택해주세요"}
            </option>
            {myTrips.map((post) => (
              <option key={post.postId} value={post.postId}>
                {/* 제목과 날짜 표시 */}
                {post.title} (
                {post.startAt
                  ? post.startAt.toString().split("T")[0]
                  : "날짜미정"}
                )
              </option>
            ))}
          </FormSelect>
        </FormGroup>

        {/* 사진 업로드 */}
        <FormGroup>
          <FormLabel>사진 ({images.length}/20)</FormLabel>
          <ImageUploadContainer>
            {images.length < 20 && (
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
                <RemoveImageButton onClick={() => handleRemoveImage(index)}>
                  ×
                </RemoveImageButton>
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

        {/* 제목 */}
        <FormGroup>
          <FormLabel>제목</FormLabel>
          <FormInput
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </FormGroup>

        {/* 내용 */}
        <FormGroup>
          <FormLabel>내용</FormLabel>
          <FormTextarea
            placeholder="여행의 추억을 자유롭게 남겨주세요."
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </FormGroup>
      </FormContainer>

      {/* 하단 버튼 */}
      <SubmitButtonContainer>
        <SubmitButton onClick={handleSubmit} disabled={!isValid || loading}>
          {loading ? "등록 중..." : "등록하기"}
        </SubmitButton>
      </SubmitButtonContainer>
    </PageLayout>
  );
};

export default ReviewCreatePage;
