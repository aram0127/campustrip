import { useState, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import SearchBar from "../../components/common/SearchBar";
import { getInfiniteReviews } from "../../api/reviews";
import { useInfiniteQuery } from "@tanstack/react-query";

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
  padding: 4px;
  color: ${({ $isActive, theme }) =>
    $isActive ? theme.colors.text : theme.colors.secondaryTextColor};
  font-weight: ${({ $isActive }) => ($isActive ? "bold" : "normal")};

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

const ReviewListContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const ReviewItem = styled(Link)`
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
  display: flex;
  flex-direction: column;
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
  flex-grow: 1;
`;

const PostMeta = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.error};
`;

function ReviewListPage() {
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  // 검색어 상태 관리
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // 정렬 상태 관리 ('latest' | 'likes')
  // 백엔드 파라미터: latest -> 'createdAt,desc', likes -> 'likes'
  const [sortOrder, setSortOrder] = useState<"latest" | "likes">("latest");

  // useInfiniteQuery 훅 사용
  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["reviews", "infinite", sortOrder, searchQuery],
    queryFn: ({ pageParam = 0 }) => {
      // 정렬 파라미터 변환
      const sortParam = sortOrder === "likes" ? "likes" : "createdAt,desc";

      return getInfiniteReviews({
        page: pageParam,
        size: 10,
        sort: sortParam,
        keyword: searchQuery || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
    initialPageParam: 0,
  });

  // 모든 페이지의 데이터를 하나의 배열로 평탄화
  const reviews = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  // 검색 핸들러
  const handleSearch = () => {
    setSearchQuery(inputValue);
  };

  // 정렬 변경 핸들러
  const handleSortChange = (order: "latest" | "likes") => {
    setSortOrder(order);
    window.scrollTo(0, 0);
  };

  // 무한 스크롤 Observer
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useMemo(() => {
    const element = observerTarget.current;
    if (!element) return;
    const observer = new IntersectionObserver(handleObserver, { threshold: 0 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [handleObserver]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR");
  };

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchBar
          placeholder="후기게시글 검색"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSearch={handleSearch}
        />

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

      <ReviewListContainer>
        {isLoading && <LoadingMessage>후기를 불러오는 중...</LoadingMessage>}
        {error && <ErrorMessage>{error.message}</ErrorMessage>}

        {!isLoading && !error && reviews.length === 0 && (
          <LoadingMessage>
            {searchQuery ? "검색 결과가 없습니다." : "등록된 후기가 없습니다."}
          </LoadingMessage>
        )}

        {!isLoading &&
          !error &&
          reviews.map((review) => {
            const excerpt =
              review.body.replace(/<[^>]*>?/gm, "").substring(0, 80) +
              (review.body.length > 80 ? "..." : "");

            const thumbnailImage =
              review.imageUrls && review.imageUrls.length > 0
                ? review.imageUrls[0]
                : undefined;

            return (
              <ReviewItem
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
              </ReviewItem>
            );
          })}

        {/* 무한 스크롤 트리거 */}
        <div ref={observerTarget} style={{ height: "20px" }} />

        {isFetchingNextPage && (
          <LoadingMessage>더 불러오는 중...</LoadingMessage>
        )}
      </ReviewListContainer>

      <FloatingActionButton onClick={() => navigate("/reviews/new")} />
    </PageContainer>
  );
}

export default ReviewListPage;
