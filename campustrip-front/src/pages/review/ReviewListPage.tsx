import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";

const PageContainer = styled.div`
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ControlsContainer = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  flex-shrink: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  box-sizing: border-box;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  align-self: flex-start;
`;

const PostListContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const PostItem = styled(Link)`
  display: flex;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  text-decoration: none;
  color: inherit;
`;

const Thumbnail = styled.div`
  width: 90px;
  height: 90px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  flex-shrink: 0;
`;

const PostContent = styled.div`
  flex-grow: 1;
`;

const PostTitle = styled.h2`
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PostExcerpt = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin: 0 0 8px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

// --- 임시 데이터 ---
const dummyReviews = [
  {
    id: 1,
    title: "실패없는 부산 여행",
    excerpt:
      "이번 여름에 다녀온 부산 여행 후기입니다. 해운대부터 광안리까지 맛집 위주로 정리했어요...",
    author: "사용자3",
    date: "2025/09/10",
    likes: 27,
  },
  {
    id: 2,
    title: "일본 먹방 여행",
    excerpt:
      "오사카와 교토에서 3박 4일동안 먹기만 한 후기! 라멘, 스시, 타코야끼 맛집 정보 공유합니다.",
    author: "사용자2",
    date: "2025/08/10",
    likes: 15,
  },
  {
    id: 3,
    title: "여름맞이 제주 여행 후기",
    excerpt:
      "친구와 함께한 2박 3일 제주 여행! 예쁜 카페와 사진 명소 위주로 다녀왔습니다.",
    author: "사용자1",
    date: "2025/07/10",
    likes: 30,
  },
];

// --- 컴포넌트 ---
function ReviewListPage() {
  const handleCreateReview = () => {
    alert("새 후기 작성 페이지로 이동합니다.");
  };

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchInput type="search" placeholder="후기 게시글 검색" />
        <SortSelect>
          <option>최신순</option>
          <option>좋아요순</option>
        </SortSelect>
      </ControlsContainer>

      <PostListContainer>
        {dummyReviews.map((review) => (
          <PostItem to={`/reviews/${review.id}`} key={review.id}>
            <Thumbnail />
            <PostContent>
              <PostTitle>{review.title}</PostTitle>
              <PostExcerpt>{review.excerpt}</PostExcerpt>
              <PostMeta>
                <span>
                  {review.author} · {review.date} · ❤️ {review.likes}
                </span>
              </PostMeta>
            </PostContent>
          </PostItem>
        ))}
      </PostListContainer>

      <FloatingActionButton onClick={handleCreateReview} />
    </PageContainer>
  );
}

export default ReviewListPage;
