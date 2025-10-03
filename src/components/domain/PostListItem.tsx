import styled from 'styled-components';

const ListItemContainer = styled.div`
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  cursor: pointer;
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.background === '#FFFFFF' ? '#f8f9fa' : '#2c2c2e'};
  }
`;

const PostTitle = styled.h2`
  font-size: 18px;
  margin: 0 0 8px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PostInfo = styled.p`
  font-size: 14px;
  margin: 0;
  color: ${({ theme }) => theme.colors.grey};
`;

// 임시로 사용할 데이터 타입 정의
interface Post {
  id: number;
  title: string;
  location: string;
  period: string;
  members: string;
}

interface PostListItemProps {
  post: Post;
}

const PostListItem: React.FC<PostListItemProps> = ({ post }) => {
  return (
    <ListItemContainer>
      <PostTitle>{post.title}</PostTitle>
      <PostInfo> {post.location}</PostInfo> 
      <PostInfo> {post.period}</PostInfo>
      <PostInfo> {post.members}</PostInfo>
    </ListItemContainer>
  );
};

export default PostListItem;