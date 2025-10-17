import React, { useState, useMemo, useEffect } from "react";
import styled from "styled-components";
import PostListItem from "../../components/domain/PostListItem";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import LocationFilterModal, {
  locationsData,
} from "../../components/domain/LocationFilterModal";
import { IoFilter } from "react-icons/io5";
import FloatingActionButton from "../../components/common/FloatingActionButton";
import { type Post } from "../../types/post";
import axios from "axios";

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
  gap: 8px;
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
  padding: 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: 20px;
  color: ${({ theme }) => theme.colors.error};
`;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function PostListPage() {
  const [posts, setPosts] = useState<Post[]>([]); // 게시글 데이터 상태
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState<string | null>(null); // 에러 상태

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("전체");

  // 컴포넌트 마운트 시 게시글 목록 가져오기
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.get<Post[]>(`${API_BASE_URL}/api/posts`);
        setPosts(response.data);
      } catch (err) {
        console.error("게시글 로딩 실패:", err);
        setError("게시글을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []); // 빈 배열을 전달하여 컴포넌트 마운트 시 1회만 실행

  const handleApplyFilter = (location: string) => {
    setSelectedLocation(location);
    // TODO: 선택된 지역으로 API 다시 호출 또는 프론트엔드 필터링 로직 강화
    console.log("선택된 지역:", location);
  };

  // 검색어와 지역 필터링 로직 (API 연동 후 필요시 백엔드 필터링으로 변경 고려)
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      // 지역 필터링 로직 (locationsData와 API 응답의 regions 정보를 활용하여 개선 필요)
      let matchesLocation = true;
      if (selectedLocation !== "전체") {
        // 현재 regions는 객체 배열이므로, regionName만 추출하여 비교
        const postRegionNames = post.regions.map((r) => r.regionName);

        if (selectedLocation === "국내 전체") {
          // domestic의 모든 지역 이름을 가져와 포함되는지 확인
          const allDomesticRegions = Object.values(locationsData.domestic)
            .flat()
            .concat(Object.keys(locationsData.domestic));
          matchesLocation = postRegionNames.some((name) =>
            allDomesticRegions.includes(name)
          );
        } else if (selectedLocation === "해외 전체") {
          matchesLocation = postRegionNames.some((name) =>
            locationsData.overseas.includes(name)
          );
        } else {
          // 특정 지역 또는 하위 지역 선택 시
          const isDomesticKey = Object.prototype.hasOwnProperty.call(
            locationsData.domestic,
            selectedLocation
          );
          if (isDomesticKey) {
            const subRegions =
              locationsData.domestic[
                selectedLocation as keyof typeof locationsData.domestic
              ];
            if (subRegions.length > 0) {
              matchesLocation = postRegionNames.some(
                (name) => subRegions.includes(name) || name === selectedLocation
              );
            } else {
              matchesLocation = postRegionNames.includes(selectedLocation);
            }
          } else {
            matchesLocation = postRegionNames.includes(selectedLocation);
          }
        }
      }

      return matchesSearch && matchesLocation;
    });
  }, [posts, searchQuery, selectedLocation]);

  const handleCreatePost = () => {
    alert("새 모집 게시글 작성 페이지로 이동");
    // navigate('/posts/new'); // 예시
  };

  return (
    <PageContainer>
      <ControlsContainer>
        <SearchBar
          placeholder="게시글 검색"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button
          variant="outline"
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
        {error && <ErrorMessage>{error}</ErrorMessage>}
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
