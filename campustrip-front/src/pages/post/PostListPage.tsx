import { useState, useMemo } from "react";
import styled from "styled-components";
import PostListItem from "../../components/domain/PostListItem";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import LocationFilterModal from "../../components/domain/LocationFilterModal";
import { IoFilter } from "react-icons/io5";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { type Post } from "../../types/post";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getPosts, getPostsByRegion } from "../../api/posts";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRegionIds, setSelectedRegionIds] = useState<number[] | null>(
    null
  );

  const navigate = useNavigate();

  const {
    data: posts = [],
    isLoading,
    error,
  } = useQuery<Post[], Error>({
    // queryKey가 selectedRegionIds 배열 자체를 참조하도록 변경
    queryKey: ["posts", selectedRegionIds],
    queryFn: () => {
      if (selectedRegionIds && selectedRegionIds.length > 0) {
        // ID 배열 전체를 백엔드로 전달
        return getPostsByRegion(selectedRegionIds);
      }
      // ID가 없으면 (전체) 모든 목록 요청
      return getPosts();
    },
  });

  const handleApplyFilter = (regionIds: number[] | null) => {
    setSelectedRegionIds(regionIds);
    console.log("선택된 지역 ID 목록:", regionIds);
  };

  // 검색어 로직
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      return matchesSearch;
    });
  }, [posts, searchQuery]);

  const handleCreatePost = () => {
    navigate("/posts/new/region"); // 1단계(지역 선택) 페이지로 이동
  };

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchBar
          placeholder="게시글 검색"
          onChange={(e) => setSearchQuery(e.target.value)}
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

        {!isLoading && !error && filteredPosts.length === 0 && (
          <LoadingMessage>표시할 게시글이 없습니다.</LoadingMessage>
        )}

        {!isLoading &&
          !error &&
          filteredPosts.map((post) => (
            <PostListItem key={post.postId} post={post} />
          ))}
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
