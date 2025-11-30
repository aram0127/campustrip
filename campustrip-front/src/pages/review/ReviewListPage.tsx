import { useState, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import SearchBar from "../../components/common/SearchBar";
import { getInfiniteReviews } from "../../api/reviews";
import { useInfiniteQuery } from "@tanstack/react-query";
import ReviewListItem from "../../components/domain/ReviewListItem";

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

  // 정렬 상태 관리
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

  const reviews = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const handleSearch = () => {
    setSearchQuery(inputValue);
  };

  const handleSortChange = (order: "latest" | "likes") => {
    setSortOrder(order);
    window.scrollTo(0, 0);
  };

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
          reviews.map((review) => (
            <ReviewListItem key={review.reviewId} review={review} />
          ))}

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
