import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "../../context/AuthContext";
import {
  getUserProfile,
  updateUserProfile,
  updateUserProfileImage,
} from "../../api/users";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";

const Container = styled(ScrollingContent)`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ProfileImageSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
  cursor: pointer;
`;

const ImageWrapper = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  margin-bottom: 12px;
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ChangeText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 600;
`;

const FormSection = styled.div`
  width: 100%;
  margin-bottom: 24px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  resize: none;
  height: 120px;
  box-sizing: border-box;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SaveButtonContainer = styled.div`
  width: 100%;
  margin-top: auto;
  padding-top: 20px;
`;

const ProfileEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: authUser, refreshProfile } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [description, setDescription] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 사용자 데이터 불러오기
  const { data: userProfile, isLoading } = useQuery({
    queryKey: ["userProfile", authUser?.id],
    queryFn: () => getUserProfile(authUser!.id),
    enabled: !!authUser,
  });

  // 데이터 로드 시 초기값 설정
  useEffect(() => {
    if (userProfile) {
      setDescription(userProfile.description || "");
      setPreviewUrl(userProfile.profilePhotoUrl || null);
    }
  }, [userProfile]);

  // 이미지 파일 선택 핸들러
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

  // 정보 수정 Mutation
  const updateInfoMutation = useMutation({
    mutationFn: async () => {
      if (!authUser) return;

      // 텍스트 정보 업데이트
      await updateUserProfile(authUser.id, {
        name: userProfile?.name,
        gender: userProfile?.gender || "",
        phoneNumber: userProfile?.phoneNumber,
        email: userProfile?.email,
        schoolEmail: userProfile?.schoolEmail,
        description: description,
      } as any);

      // 이미지가 변경되었다면 이미지 업데이트
      if (selectedFile) {
        await updateUserProfileImage(authUser.id, selectedFile);
      }
    },
    onSuccess: async () => {
      await refreshProfile();

      queryClient.invalidateQueries({
        queryKey: ["userProfile", authUser?.id],
      });

      alert("프로필이 수정되었습니다.");
      navigate(-1);
    },
    onError: (err) => {
      console.error(err);
      alert("수정 중 오류가 발생했습니다.");
    },
  });

  const handleSave = () => {
    updateInfoMutation.mutate();
  };

  if (isLoading || !userProfile) {
    return (
      <PageLayout title="프로필 수정">
        <div style={{ padding: 20, textAlign: "center" }}>로딩 중...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="프로필 수정" showBackButton={true}>
      <Container>
        {/* 프로필 사진 변경 섹션 */}
        <ProfileImageSection onClick={handleImageClick}>
          <ImageWrapper>
            <ProfileImage
              src={previewUrl || "/default-profile.png"}
              alt="Profile"
            />
          </ImageWrapper>
          <ChangeText>사진 변경</ChangeText>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            accept="image/*"
            onChange={handleFileChange}
          />
        </ProfileImageSection>

        {/* 자기소개 섹션 */}
        <FormSection>
          <Label>자기소개</Label>
          <StyledTextArea
            placeholder="자신을 자유롭게 소개해주세요."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={200}
          />
        </FormSection>

        {/* 저장 버튼 */}
        <SaveButtonContainer>
          <Button
            $size="large"
            style={{ width: "100%" }}
            onClick={handleSave}
            disabled={updateInfoMutation.isPending}
          >
            {updateInfoMutation.isPending ? "저장 중..." : "저장하기"}
          </Button>
        </SaveButtonContainer>
      </Container>
    </PageLayout>
  );
};

export default ProfileEditPage;
