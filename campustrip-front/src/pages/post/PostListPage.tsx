import { useState, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import PostListItem from "../../components/domain/PostListItem";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import LocationFilterModal from "../../components/domain/LocationFilterModal";
import { IoFilter } from "react-icons/io5";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getInfinitePosts } from "../../api/posts";

const PageContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const ControlsContainer = styled.div`
  padding: ${({ theme }) => theme.spacings.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacings.xsmall};
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  align-items: center;
  flex-shrink: 0;
`;

const PostListContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const LoadingMessage = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacings.large};
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: ${({ theme }) => theme.spacings.large};
  color: ${({ theme }) => theme.colors.error};
`;

function PostListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[] | null>(
    null
  );
  const observerTarget = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite", selectedRegionIds, searchQuery],
    queryFn: ({ pageParam = 0 }) => {
      return getInfinitePosts({
        page: pageParam,
        size: 10,
        sort: "createdAt,desc",
        regionIds: selectedRegionIds || undefined,
        keyword: searchQuery || undefined,
      });
    },
    getNextPageParam: (lastPage) => {
      return lastPage.last ? undefined : lastPage.number + 1;
    },
    initialPageParam: 0,
  });

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.content) ?? [];
  }, [data]);

  const handleSearch = () => {
    console.log("검색 실행:", inputValue);
    setSearchQuery(inputValue);
  };

  const handleApplyFilter = (regionIds: number[] | null) => {
    setSelectedRegionIds(regionIds);
    console.log("선택된 지역 ID 목록:", regionIds);
  };

  const handleCreatePost = () => {
    navigate("/posts/new/region");
  };

  // Intersection Observer를 사용한 무한 스크롤
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // Observer 설정
  useMemo(() => {
    const element = observerTarget.current;
    if (!element) return;

    const option = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);

    return () => observer.disconnect();
  }, [handleObserver]);

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchBar
          placeholder="모집게시글 검색"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSearch={handleSearch}
        />
        <Button
          $variant="outline"
          onClick={() => setIsModalOpen(true)}
          style={{
            flexShrink: 0,
            width: "42px",
            height: "42px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IoFilter size={20} />
        </Button>
      </ControlsContainer>

      <PostListContainer>
        {isLoading && <LoadingMessage>게시글을 불러오는 중...</LoadingMessage>}
        {error && <ErrorMessage>{error.message}</ErrorMessage>}

        {!isLoading && !error && posts.length === 0 && (
          <LoadingMessage>
            {searchQuery
              ? "검색 결과가 없습니다."
              : "표시할 게시글이 없습니다."}
          </LoadingMessage>
        )}

        {!isLoading &&
          !error &&
          posts.map((post) => <PostListItem key={post.postId} post={post} />)}

        {/* 무한 스크롤 트리거 */}
        <div ref={observerTarget} style={{ height: "20px" }} />

        {isFetchingNextPage && (
          <LoadingMessage>더 불러오는 중...</LoadingMessage>
        )}
      </PostListContainer>

      <LocationFilterModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onApply={handleApplyFilter}
      />
      <FloatingActionButton onClick={handleCreatePost} />
    </PageContainer>
  );
}

export default PostListPage;
