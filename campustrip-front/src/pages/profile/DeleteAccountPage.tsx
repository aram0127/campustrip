import React, { useState } from "react";
import styled from "styled-components";
import { useMutation } from "@tanstack/react-query";
import { deleteUserAccount } from "../../api/users";
import { useAuth } from "../../context/AuthContext";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const Container = styled(ScrollingContent)`
  padding: 24px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WarningBox = styled.div`
  background-color: ${({ theme }) =>
    theme.colors.background === "#FFFFFF"
      ? "#fff9e6"
      : "rgba(255, 193, 7, 0.15)"};

  border: 1px solid
    ${({ theme }) =>
      theme.colors.background === "#FFFFFF"
        ? "#ffeeba"
        : "rgba(255, 193, 7, 0.3)"};

  border-radius: 8px;
  padding: 20px;
  margin-bottom: 32px;
  width: 100%;
  box-sizing: border-box;
`;

const WarningTitle = styled.h3`
  font-size: 16px;
  font-weight: bold;
  color: ${({ theme }) =>
    theme.colors.background === "#FFFFFF" ? "#856404" : "#FFC107"};
  margin: 0 0 8px 0;
`;

const WarningText = styled.p`
  font-size: 14px;
  color: ${({ theme }) =>
    theme.colors.background === "#FFFFFF" ? "#856404" : "#FFC107"};
  line-height: 1.6;
  margin: 0;
  word-break: keep-all;
  opacity: 0.9;
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 40px;
  cursor: pointer;
  width: 100%;
  padding: 4px 0;
`;

const CheckboxInput = styled.input.attrs({ type: "checkbox" })`
  width: 22px;
  height: 22px;
  accent-color: ${({ theme }) => theme.colors.primary};
  cursor: pointer;
  flex-shrink: 0;
`;

const CheckboxLabel = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: 500;
`;

const InputGroup = styled.div`
  width: 100%;
  margin-bottom: 16px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
  align-self: flex-start;
`;

const BottomButton = styled(Button)`
  margin-top: 24px;
  width: 100%;
`;

const DeleteAccountPage: React.FC = () => {
  const { user, logout } = useAuth();

  const [password, setPassword] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!user) throw new Error("사용자 정보가 없습니다.");
      return deleteUserAccount(user.id, password);
    },
    onSuccess: () => {
      alert("회원 탈퇴가 완료되었습니다.");
      logout();
    },
    onError: (error: any) => {
      console.error("탈퇴 실패:", error);
      if (error.response?.status === 403 || error.response?.status === 500) {
        alert("비밀번호가 일치하지 않거나 탈퇴 처리에 실패했습니다.");
      } else {
        alert("오류가 발생했습니다. 다시 시도해주세요.");
      }
    },
  });

  const handleDelete = () => {
    if (!isAgreed) {
      alert("탈퇴 유의사항에 동의해주세요.");
      return;
    }
    if (!password) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (
      window.confirm("정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.")
    ) {
      deleteMutation.mutate();
    }
  };

  return (
    <PageLayout title="회원 탈퇴" showBackButton={true}>
      <Container>
        <WarningBox>
          <WarningTitle>정말 탈퇴하시겠습니까?</WarningTitle>
          <WarningText>
            계정을 탈퇴하시면 회원님의 계정 정보가 영구적으로 삭제되며, 다시는
            복구할 수 없습니다.
          </WarningText>
        </WarningBox>

        <CheckboxContainer>
          <CheckboxInput
            checked={isAgreed}
            onChange={(e) => setIsAgreed(e.target.checked)}
          />
          <CheckboxLabel>
            위 내용을 모두 확인했으며, 탈퇴에 동의합니다.
          </CheckboxLabel>
        </CheckboxContainer>

        <InputGroup>
          <InputLabel>본인 확인을 위해 비밀번호를 입력해주세요.</InputLabel>
          <Input
            type="password"
            placeholder="현재 비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <BottomButton
            $variant="danger"
            $size="large"
            onClick={handleDelete}
            disabled={!isAgreed || !password || deleteMutation.isPending}
          >
            {deleteMutation.isPending ? "처리 중..." : "회원 탈퇴"}
          </BottomButton>
        </InputGroup>
      </Container>
    </PageLayout>
  );
};

export default DeleteAccountPage;
