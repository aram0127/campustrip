import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { IoHeart } from "react-icons/io5";
import { type Review } from "../../types/review";

const ReviewItemContainer = styled(Link)`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  text-decoration: none;
  color: inherit;
  align-items: flex-start;
  justify-content: space-between;

  &:hover {
    background-color: ${({ theme }) => theme.colors.inputBackground};
  }
`;

const Thumbnail = styled.div<{ $imageUrl?: string }>`
  width: 90px;
  height: 90px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
  background-image: ${({ $imageUrl }) =>
    $imageUrl ? `url(${$imageUrl})` : "none"};
  background-size: cover;
  background-position: center;
`;

const PostContent = styled.div`
  flex-grow: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  min-height: 90px;
  justify-content: space-between;
`;

const TextGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const PostTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const PostExcerpt = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
`;

const PostMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const LikeStat = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR");
};

interface ReviewListItemProps {
  review: Review;
}

const ReviewListItem: React.FC<ReviewListItemProps> = ({ review }) => {
  const excerpt =
    review.body.replace(/<[^>]*>?/gm, "").substring(0, 80) +
    (review.body.length > 80 ? "..." : "");

  const thumbnailImage =
    review.imageUrls && review.imageUrls.length > 0
      ? review.imageUrls[0]
      : undefined;

  return (
    <ReviewItemContainer to={`/reviews/${review.reviewId}`}>
      <PostContent>
        <TextGroup>
          <PostTitle>{review.title}</PostTitle>
          <PostExcerpt>{excerpt}</PostExcerpt>
        </TextGroup>
        <PostMeta>
          <span>
            {review.user.name} · {formatDate(review.createdAt)}
          </span>
          <LikeStat>
            <IoHeart color="#FF3B30" size={12} />
            {review.likeCount || 0}
          </LikeStat>
        </PostMeta>
      </PostContent>

      {thumbnailImage && <Thumbnail $imageUrl={thumbnailImage} />}
    </ReviewItemContainer>
  );
};

export default ReviewListItem;
