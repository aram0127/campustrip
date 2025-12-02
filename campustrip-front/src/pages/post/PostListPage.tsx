import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import styled from "styled-components";
import PostListItem from "../../components/domain/PostListItem";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import LocationFilterModal from "../../components/domain/LocationFilterModal";
import { IoFilter, IoClose, IoSchool } from "react-icons/io5";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getInfinitePosts } from "../../api/posts";
import { useAuth } from "../../context/AuthContext";
import { getUserProfile } from "../../api/users";

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

const FilterChipsContainer = styled.div`
  padding: ${({ theme }) => theme.spacings.small} ${({ theme }) => theme.spacings.medium};
  display: flex;
  gap: ${({ theme }) => theme.spacings.xsmall};
  flex-wrap: wrap;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  background-color: ${({ theme }) => theme.colors.background};
`;

const FilterChip = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: 16px;
  font-size: 14px;
  font-weight: 500;

  svg {
    cursor: pointer;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 0.7;
    }
  }
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
  const [universityFilter, setUniversityFilter] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["posts", "infinite", selectedRegionIds, universityFilter?.id, searchQuery],
    queryFn: ({ pageParam = 0 }) => {
      return getInfinitePosts({
        page: pageParam,
        size: 10,
        sort: "createdAt,desc",
        regionIds: selectedRegionIds || undefined,
        universityId: universityFilter?.id || undefined,
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

  const handleUniversityFilter = useCallback(async () => {
    // 이미 필터가 적용되어 있으면 토글(제거)
    if (universityFilter) {
      setUniversityFilter(null);
      console.log("대학교 필터 해제");
      return;
    }

    // 필터 적용
    if (user) {
      try {
        const userProfile = await getUserProfile(user.id);
        setUniversityFilter({
          id: userProfile.universityId,
          name: userProfile.university,
        });
        console.log("대학교 필터 적용:", userProfile.university);
      } catch (error) {
        console.error("사용자 프로필 로드 실패:", error);
      }
    }
  }, [user, universityFilter]);

  // 컴포넌트 마운트 시 자동으로 대학교 필터 적용
  useEffect(() => {
    if (user && !universityFilter) {
      const applyInitialFilter = async () => {
        try {
          const userProfile = await getUserProfile(user.id);
          setUniversityFilter({
            id: userProfile.universityId,
            name: userProfile.university,
          });
          console.log("초기 대학교 필터 적용:", userProfile.university);
        } catch (error) {
          console.error("사용자 프로필 로드 실패:", error);
        }
      };
      applyInitialFilter();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRemoveUniversityFilter = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지
    setUniversityFilter(null);
    console.log("X 버튼으로 대학교 필터 해제");
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
          $variant={universityFilter ? "primary" : "outline"}
          onClick={handleUniversityFilter}
          style={{
            flexShrink: 0,
            width: "42px",
            height: "42px",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title={universityFilter ? "우리 학교 필터 해제" : "우리 학교 필터"}
        >
          <IoSchool size={20} />
        </Button>
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
          title="지역 필터"
        >
          <IoFilter size={20} />
        </Button>
      </ControlsContainer>

      {/* 필터 칩 표시 영역 */}
      {universityFilter && (
        <FilterChipsContainer>
          <FilterChip>
            <IoSchool size={16} />
            {universityFilter.name}
            <IoClose size={18} onClick={handleRemoveUniversityFilter} />
          </FilterChip>
        </FilterChipsContainer>
      )}

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
