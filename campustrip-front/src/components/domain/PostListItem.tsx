import styled from "styled-components";
import { type Post } from "../../types/post";

const ListItemContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  cursor: pointer;

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
  margin: 4px 0 0 0; /* 위쪽 마진 추가 */
  color: ${({ theme }) => theme.colors.grey};
`;

interface PostListItemProps {
  post: Post; // 타입을 Post로 변경
}

// 날짜 포맷팅 함수
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  return (
    // 클릭 시 상세 페이지로 이동하는 Link 추가
    // <ListItemContainer as={Link} to={`/posts/${post.postId}`}>
    <ListItemContainer>
      <PostTitle>{post.title}</PostTitle>
      {/* 백엔드 데이터 필드에 맞게 수정 */}
      <PostInfo>
        👤 작성자: {post.membershipId.name} ({post.membershipId.userId})
      </PostInfo>
      <PostInfo>📅 작성일: {formatDate(post.createdAt)}</PostInfo>
      {/* 필요한 다른 정보 추가 */}
      {post.regions.length > 0 && (
        <PostInfo>
          📍 지역: {post.regions.map((r) => r.regionName).join(", ")}
        </PostInfo>
      )}
      <PostInfo>👥 모집 인원: {post.teamSize}명</PostInfo>
    </ListItemContainer>
    // </ListItemContainer>
  );
};

export default PostListItem;
