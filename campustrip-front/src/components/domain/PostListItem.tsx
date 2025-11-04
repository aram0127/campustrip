import styled from "styled-components";
import { type Post } from "../../types/post";
import { Link } from "react-router-dom";

const ListItemContainer = styled(Link)`
  display: block;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  cursor: pointer;
  text-decoration: none;
  color: inherit;

  &:hover {
    background-color: ${({ theme }) =>
      theme.colors.background === "#FFFFFF" ? "#f8f9fa" : "#2c2c2e"};
  }
`;

const PostTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PostInfo = styled.p`
  font-size: 14px;
  margin: 4px 0 0 0;
  color: ${({ theme }) => theme.colors.grey};
`;

interface PostListItemProps {
  post: Post;
}

const getRegionNames = (regions: Post["regions"]): string => {
  if (!regions || regions.length === 0) {
    return "지역 정보 없음";
  }

  return regions.map((r) => r.name).join(", ");
};

const getDummyPeriod = (postId: number): string => {
  if (postId % 3 === 0) return "11/1 ~ 11/2 (1박 2일)";
  if (postId % 2 === 0) return "9/14 ~ 9/17 (3박 4일)";
  return "10/25 ~ 10/30 (5박 6일)";
};

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  console.log(post);
  return (
    <ListItemContainer to={`/posts/${post.postId}`}>
      <PostTitle>{post.title}</PostTitle>
      <PostInfo>📍 {getRegionNames(post.regions)}</PostInfo>
      <PostInfo>📅 {getDummyPeriod(post.postId)}</PostInfo>
      <PostInfo>
        👥 모집 인원 [{post.memberSize ?? 0}/{post.teamSize}]
      </PostInfo>
    </ListItemContainer>
  );
};

export default PostListItem;
