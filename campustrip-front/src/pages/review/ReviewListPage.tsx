import { useEffect, useState } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import SearchBar from "../../components/common/SearchBar";
import { getReviews } from "../../api/reviews";
import { type Review } from "../../types/review";

const PageContainer = styled.div`
  width: 100%;
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
  background-color: ${({ theme }) => theme.colors.background};
`;

const SortContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-right: 4px;
`;

const SortButton = styled.button<{ $isActive: boolean }>`
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text : theme.colors.secondaryTextColor};
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};

  padding: 4px;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }
`;

const Divider = styled.span`
  color: ${({ theme }) => theme.colors.borderColor};
  font-size: 12px;
  display: flex;
  align-items: center;
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
  line-height: 1.4;
`;

const PostMeta = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

function ReviewListPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<"latest" | "likes">("latest"); // 정렬 상태 관리

  const navigate = useNavigate();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await getReviews();
      // 여기서 sortOrder에 따라 data를 정렬하거나, API 요청 시 파라미터로 보낼 수 있음
      // 현재는 클라이언트 사이드 정렬 예시:
      if (sortOrder === "latest") {
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      setReviews(data);
    } catch (error) {
      console.error("리뷰 목록을 불러오는데 실패했습니다.", error);
    } finally {
      setLoading(false);
    }
  };

  // 정렬 변경 핸들러
  const handleSortChange = (order: "latest" | "likes") => {
    setSortOrder(order);
    // 실제로는 여기서 API를 다시 호출하거나 state를 정렬해야 함
    // 예시: setReviews([...reviews].sort(...))
  };

  const handleCreateReview = () => {
    navigate("/reviews/new");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchBar placeholder="후기 게시글 검색" />

        <SortContainer>
          <SortButton
            $isActive={sortOrder === "latest"}
            onClick={() => handleSortChange("latest")}
          >
            최신순
          </SortButton>
          <Divider>|</Divider>
          <SortButton
            $isActive={sortOrder === "likes"}
            onClick={() => handleSortChange("likes")}
          >
            좋아요순
          </SortButton>
        </SortContainer>
      </ControlsContainer>

      <PostListContainer>
        {loading ? (
          <div style={{ padding: "16px", textAlign: "center" }}>로딩 중...</div>
        ) : reviews.length === 0 ? (
          <div style={{ padding: "16px", textAlign: "center" }}>
            등록된 후기가 없습니다.
          </div>
        ) : (
          reviews.map((review) => {
            const excerpt =
              review.body.replace(/<[^>]*>?/gm, "").substring(0, 100) + "...";
            const thumbnailImage =
              review.imageUrls && review.imageUrls.length > 0
                ? review.imageUrls[0]
                : undefined;

            return (
              <PostItem
                to={`/reviews/${review.reviewId}`}
                key={review.reviewId}
              >
                <Thumbnail $imageUrl={thumbnailImage} />
                <PostContent>
                  <PostTitle>{review.title}</PostTitle>
                  <PostExcerpt>{excerpt}</PostExcerpt>
                  <PostMeta>
                    <span>
                      {review.user.name} · {formatDate(review.createdAt)}
                    </span>
                  </PostMeta>
                </PostContent>
              </PostItem>
            );
          })
        )}
      </PostListContainer>

      <FloatingActionButton onClick={handleCreateReview} />
    </PageContainer>
  );
}

export default ReviewListPage;
