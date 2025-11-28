import React, { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  IoHeart,
  IoHeartOutline,
  IoSend,
  IoTrashOutline,
  IoEllipsisHorizontal,
  IoArrowForward,
} from "react-icons/io5";
import {
  getReviewById,
  deleteReview,
  likeReview,
  unlikeReview,
  getComments,
  addComment,
  deleteReviewComment,
} from "../../api/reviews";
import { useAuth } from "../../context/AuthContext";
import PageLayout, {
  ScrollingContent,
} from "../../components/layout/PageLayout";
import { type Review, type Comment } from "../../types/review";

const Container = styled(ScrollingContent)`
  padding: 0 0 80px 0;
`;

const ContentWrapper = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
`;

const AuthorHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const AuthorInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const AuthorName = styled.span`
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ImageSlider = styled.div`
  display: flex;
  gap: 10px;
  overflow-x: auto;
  margin-bottom: 20px;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.borderColor};
    border-radius: 2px;
  }
`;

const ReviewImage = styled.img`
  height: 200px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const BodyText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 24px;
`;

const ActionSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
`;

const LikeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  padding: 0;

  svg {
    font-size: 24px;
    color: ${({ theme }) => theme.colors.error};
  }
`;

const LinkButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-weight: bold;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: #e0e0e0;
  }
`;

const CommentSection = styled.div`
  padding: 20px;
`;

const CommentHeader = styled.h3`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CommentItem = styled.div`
  display: flex;
  gap: 10px;
`;

const CommentContent = styled.div`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
`;

const CommentAuthor = styled.div`
  font-weight: bold;
  font-size: 13px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.text};
`;

const CommentBody = styled.p`
  font-size: 14px;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
  line-height: 1.4;
`;

const CommentDate = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  display: block;
  margin-top: 6px;
`;

const DeleteCommentButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.grey};
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const InputArea = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-top: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  gap: 8px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  z-index: 10;
`;

const CommentInput = styled.input`
  flex: 1;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 24px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 8px;

  &:disabled {
    color: ${({ theme }) => theme.colors.grey};
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  top: 50px;
  right: 10px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 20;
  overflow: hidden;
  width: 120px;
`;

const DropdownItem = styled.button<{ $isDelete?: boolean }>`
  display: block;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme, $isDelete }) =>
    $isDelete ? theme.colors.error : theme.colors.text};

  &:hover {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const HeaderIconButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  color: ${({ theme }) => theme.colors.text};
`;

const ReviewDetailPage: React.FC = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const numericReviewId = Number(reviewId);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [commentText, setCommentText] = useState("");
  const [isLiked, setIsLiked] = useState(false); // 로컬 상태 (API 응답에 isLiked가 있다고 가정하거나 별도 조회 필요)
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 후기 상세 조회
  const {
    data: review,
    isLoading,
    error,
  } = useQuery<Review, Error>({
    queryKey: ["review", numericReviewId],
    queryFn: () => getReviewById(numericReviewId),
    enabled: !!numericReviewId,
  });

  // 댓글 목록 조회
  const { data: comments = [] } = useQuery<Comment[], Error>({
    queryKey: ["comments", numericReviewId],
    queryFn: () => getComments(numericReviewId),
    enabled: !!numericReviewId,
  });

  // 좋아요 Mutation
  const likeMutation = useMutation({
    mutationFn: () => likeReview(numericReviewId),
    onSuccess: () => {
      setIsLiked(true);
      // queryClient.invalidateQueries(...) // 필요시 리패치
    },
  });

  const unlikeMutation = useMutation({
    mutationFn: () => unlikeReview(numericReviewId),
    onSuccess: () => {
      setIsLiked(false);
    },
  });

  const handleLikeToggle = () => {
    if (!user) return alert("로그인이 필요합니다.");
    if (isLiked) unlikeMutation.mutate();
    else likeMutation.mutate();
  };

  // 댓글 작성 Mutation
  const commentMutation = useMutation({
    mutationFn: (text: string) => addComment(numericReviewId, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({
        queryKey: ["comments", numericReviewId],
      });
    },
  });

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    if (!user) return alert("로그인이 필요합니다.");
    commentMutation.mutate(commentText);
  };

  // 댓글 삭제 Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: number) =>
      deleteReviewComment(numericReviewId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["comments", numericReviewId],
      });
    },
  });

  // 후기 삭제 Mutation
  const deleteReviewMutation = useMutation({
    mutationFn: () => deleteReview(numericReviewId),
    onSuccess: () => {
      alert("후기가 삭제되었습니다.");
      navigate("/reviews");
    },
  });

  const handleDeleteReview = () => {
    if (window.confirm("정말로 이 후기를 삭제하시겠습니까?")) {
      deleteReviewMutation.mutate();
    }
  };

  // 작성자 확인
  const isMyReview = user?.id === review?.user.id;

  if (isLoading)
    return (
      <PageLayout title="로딩 중...">
        <div style={{ padding: 20, textAlign: "center" }}>로딩 중...</div>
      </PageLayout>
    );
  if (error || !review)
    return (
      <PageLayout title="오류">
        <div style={{ padding: 20, textAlign: "center" }}>
          후기 정보를 찾을 수 없습니다.
        </div>
      </PageLayout>
    );

  return (
    <PageLayout
      title="후기게시글"
      onBackClick={() => navigate("/reviews")}
      headerRight={
        isMyReview && (
          <div style={{ position: "relative" }}>
            <HeaderIconButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <IoEllipsisHorizontal />
            </HeaderIconButton>
            {isMenuOpen && (
              <DropdownMenu>
                <DropdownItem
                  onClick={() => navigate(`/reviews/edit/${reviewId}`)}
                >
                  수정
                </DropdownItem>
                <DropdownItem onClick={handleDeleteReview} $isDelete>
                  삭제
                </DropdownItem>
              </DropdownMenu>
            )}
          </div>
        )
      }
    >
      <Container>
        <ContentWrapper>
          <AuthorHeader onClick={() => navigate(`/profile/${review.user.id}`)}>
            <Avatar />
            <AuthorInfo>
              <AuthorName>{review.user.name}</AuthorName>
              <DateText>
                {new Date(review.createdAt).toLocaleDateString()}
              </DateText>
            </AuthorInfo>
          </AuthorHeader>

          <Title>{review.title}</Title>

          {review.imageUrls && review.imageUrls.length > 0 && (
            <ImageSlider>
              {review.imageUrls.map((url, idx) => (
                <ReviewImage
                  key={idx}
                  src={url}
                  alt={`review-img-${idx}`}
                  onClick={() => window.open(url, "_blank")}
                />
              ))}
            </ImageSlider>
          )}

          <BodyText>{review.body}</BodyText>

          <ActionSection>
            <LikeButton onClick={handleLikeToggle}>
              {isLiked ? <IoHeart /> : <IoHeartOutline />}
              {/* 좋아요 수는 API 응답에 있다면 표시 */}
              <span>좋아요</span>
            </LikeButton>

            <LinkButton onClick={() => navigate(`/posts/${review.postId}`)}>
              해당 여행 보기 <IoArrowForward />
            </LinkButton>
          </ActionSection>
        </ContentWrapper>

        <CommentSection>
          <CommentHeader>댓글 {comments.length}</CommentHeader>
          <CommentList>
            {comments.map((comment) => (
              <CommentItem key={comment.id}>
                <Avatar style={{ width: 32, height: 32 }} />
                <CommentContent>
                  <CommentAuthor>{comment.userName}</CommentAuthor>
                  <CommentBody>{comment.body}</CommentBody>
                  <CommentDate>
                    {new Date(comment.createdAt).toLocaleString()}
                  </CommentDate>

                  {user?.id === comment.userId && (
                    <DeleteCommentButton
                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                    >
                      <IoTrashOutline />
                    </DeleteCommentButton>
                  )}
                </CommentContent>
              </CommentItem>
            ))}
          </CommentList>
        </CommentSection>
      </Container>

      <InputArea>
        <CommentInput
          placeholder="댓글을 남겨보세요..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit(e)}
        />
        <SendButton
          onClick={handleCommentSubmit}
          disabled={!commentText.trim() || commentMutation.isPending}
        >
          <IoSend />
        </SendButton>
      </InputArea>
    </PageLayout>
  );
};

export default ReviewDetailPage;
