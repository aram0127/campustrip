import styled from "styled-components";
import { type Post } from "../../types/post";
import { Link } from "react-router-dom";

const ListItemContainer = styled(Link)`
  display: flex;
  gap: 16px;
  padding: ${({ theme }) => theme.spacings.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#FFFFFF" ? "#f8f9fa" : "#2c2c2e"};
  }
`;

const TextContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const Thumbnail = styled.img`
  width: 80px;
  height: 80px;
  border-radius: 8px;
  object-fit: cover;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const PostTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.body}; /* 16px */
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 ${({ theme }) => theme.spacings.xsmall} 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PostInfo = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.caption}; /* 12px  */
  margin: ${({ theme }) => theme.spacings.xxsmall} 0 0 0;
  color: ${({ theme }) => theme.colors.grey};
`;

// 날짜 포맷팅
const formatDateRange = (start: string | null, end: string | null): string => {
  if (start && end) {
    const startDate = start.split("T")[0];
    const endDate = end.split("T")[0];
    if (startDate === endDate) {
      return startDate;
    }
    return `${startDate} ~ ${endDate}`;
  }
  if (start) {
    return `${start.split("T")[0]} ~ 미정`;
  }
  if (end) {
    return `미정 ~ ${end.split("T")[0]}`;
  }
  return "일정 미정";
};

interface PostListItemProps {
  post: Post;
}

const getRegionNames = (regions: Post["regions"]): string => {
  if (!regions || regions.length === 0) {
    return "지역 정보 없음";
  }

  return regions.map((r) => r.name).join(", ");
};

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  const thumbnailSrc =
    post.postAssets && post.postAssets.length > 0 ? post.postAssets[0] : null;

  return (
    <ListItemContainer to={`/posts/${post.postId}`}>
      <TextContent>
        <PostTitle>{post.title}</PostTitle>
        <PostInfo>📍 {getRegionNames(post.regions)}</PostInfo>
        <PostInfo>📅 {formatDateRange(post.startAt, post.endAt)}</PostInfo>
        <PostInfo>
          👥 모집 인원 [{post.memberSize ?? 0}/{post.teamSize}]
        </PostInfo>
      </TextContent>
      {thumbnailSrc && <Thumbnail src={thumbnailSrc} alt="thumbnail" />}
    </ListItemContainer>
  );
};

export default PostListItem;
