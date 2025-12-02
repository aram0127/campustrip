import React, { useState } from "react";
import styled from "styled-components";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IoThumbsUp, IoThumbsDown } from "react-icons/io5";
import Modal from "../common/Modal";
import Button from "../common/Button";
import { rateUser, type CreateUserRateRequest } from "../../api/users";
import { type User } from "../../types/user";

const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px 0;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.text};
`;

const UserInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const Avatar = styled.div<{ $imageUrl?: string }>`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  background-image: url(${({ $imageUrl }) =>
    $imageUrl || "/default-profile.png"});
  background-size: cover;
  background-position: center;
  margin-bottom: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const Description = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  line-height: 1.4;

  span {
    font-weight: bold;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 32px;
  margin-bottom: 24px;
`;

const RatingButton = styled.button<{
  $active: boolean;
  $type: "like" | "dislike";
}>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  cursor: pointer;
  transition: transform 0.1s;

  svg {
    font-size: 48px;
    color: ${({ theme, $active, $type }) =>
      $active
        ? $type === "like"
          ? theme.colors.primary
          : theme.colors.error
        : theme.colors.borderColor};
    transition: color 0.2s;
  }

  span {
    font-size: 14px;
    font-weight: ${({ $active }) => ($active ? "bold" : "normal")};
    color: ${({ theme, $active, $type }) =>
      $active
        ? $type === "like"
          ? theme.colors.primary
          : theme.colors.error
        : theme.colors.secondaryTextColor};
  }

  &:hover {
    transform: scale(1.1);
  }
`;

const TextAreaLabel = styled.label`
  align-self: flex-start;
  font-size: 14px;
  font-weight: bold;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const StyledTextArea = styled.textarea`
  width: 100%;
  height: 120px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;
  resize: none;
  box-sizing: border-box;
  font-family: inherit;
  margin-bottom: 24px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

interface UserRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUser: User;
  onRateSuccess?: () => void;
}

const UserRatingModal: React.FC<UserRatingModalProps> = ({
  isOpen,
  onClose,
  targetUser,
  onRateSuccess,
}) => {
  const queryClient = useQueryClient();
  const [rate, setRate] = useState<1 | -1 | null>(null); // 1: 좋아요, -1: 싫어요
  const [comment, setComment] = useState("");

  const mutation = useMutation({
    mutationFn: rateUser,
    onSuccess: () => {
      alert("평가가 등록되었습니다.");
      queryClient.invalidateQueries({
        queryKey: ["userProfile", targetUser.id],
      });
      if (onRateSuccess) onRateSuccess();
      handleClose();
    },
    onError: (err) => {
      console.error(err);
      alert("평가 등록 중 오류가 발생했습니다.");
    },
  });

  const handleSubmit = () => {
    if (rate === null) {
      alert("평가(좋아요/싫어요)를 선택해주세요.");
      return;
    }

    const payload: CreateUserRateRequest = {
      targetId: targetUser.id,
      rate: rate,
      comment: comment,
    };

    mutation.mutate(payload);
  };

  const handleClose = () => {
    setRate(null);
    setComment("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContainer>
        <Title>동행 평가하기</Title>

        <UserInfo>
          <Avatar $imageUrl={targetUser.profilePhotoUrl} />
          <Description>
            <span>{targetUser.name}</span>님과의
            <br />
            여행은 어떠셨나요?
          </Description>
        </UserInfo>

        <RatingContainer>
          <RatingButton
            $active={rate === 1}
            $type="like"
            onClick={() => setRate(1)}
          >
            <IoThumbsUp />
            <span>좋아요</span>
          </RatingButton>
          <RatingButton
            $active={rate === -1}
            $type="dislike"
            onClick={() => setRate(-1)}
          >
            <IoThumbsDown />
            <span>싫어요</span>
          </RatingButton>
        </RatingContainer>

        <TextAreaLabel>상세 후기</TextAreaLabel>
        <StyledTextArea
          placeholder="함께한 동행에 대한 솔직한 후기를 남겨주세요."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <Button
          $size="large"
          style={{ width: "100%" }}
          onClick={handleSubmit}
          disabled={rate === null || mutation.isPending}
        >
          {mutation.isPending ? "등록 중..." : "등록하기"}
        </Button>
      </ModalContainer>
    </Modal>
  );
};

export default UserRatingModal;
