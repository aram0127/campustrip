import React, { useState, useMemo } from "react";
import styled from "styled-components";
import PostListItem from "../../components/domain/PostListItem";
import SearchBar from "../../components/common/SearchBar";
import Button from "../../components/common/Button";
import LocationFilterModal, {
  locationsData,
} from "../../components/domain/LocationFilterModal";
import { IoFilter } from "react-icons/io5";
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
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey};
  align-items: center;
  flex-shrink: 0;
`;

const PostListContainer = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

// 임시 데이터
const dummyPosts = [
  {
    id: 1,
    title: "제주도 한라산 등반할 분 구해요!",
    location: "제주도",
    period: "10/25 ~ 10/30 (5박 6일)",
    members: "모집 인원 [1/8]",
  },
  {
    id: 2,
    title: "오키나와 여행 갈 사람 모여라~",
    location: "일본",
    period: "9/14 ~ 9/17 (3박 4일)",
    members: "모집 인원 [5/5]",
  },
  {
    id: 3,
    title: "경주 불국사 탐방 같이 갈 사람 구해요",
    location: "경주시",
    period: "11/1 ~ 11/2 (1박 2일)",
    members: "모집 인원 [2/4]",
  },
  {
    id: 4,
    title: "서울 맛집 탐방",
    location: "서울특별시",
    period: "주말",
    members: "모집 인원 [1/4]",
  },
  {
    id: 5,
    title: "구미 금오산 등산 동행",
    location: "구미시",
    period: "주말 당일치기",
    members: "모집 인원 [1/3]",
  },
];

function PostListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("전체"); // 기본값을 전체로

  const handleApplyFilter = (location: string) => {
    setSelectedLocation(location);
  };

  const filteredPosts = useMemo(() => {
    return dummyPosts.filter((post) => {
      const matchesSearch = post.title
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

      let matchesLocation = true;
      if (selectedLocation === "국내 전체") {
        matchesLocation =
          Object.values(locationsData.domestic)
            .flat()
            .includes(post.location) ||
          Object.keys(locationsData.domestic).includes(post.location);
      } else if (selectedLocation === "해외 전체") {
        matchesLocation = locationsData.overseas.includes(post.location);
      } else if (selectedLocation !== "전체") {
        return matchesSearch; // '전체' 선택 시, 검색어만으로 필터링
      }

      const isDomesticKey = Object.prototype.hasOwnProperty.call(
        locationsData.domestic,
        selectedLocation
      );

      if (isDomesticKey) {
        const subRegions =
          locationsData.domestic[
            selectedLocation as keyof typeof locationsData.domestic
          ];
        // 하위 지역이 있는 경우
        if (subRegions.length > 0) {
          return (
            matchesSearch &&
            (subRegions.includes(post.location) ||
              post.location === selectedLocation)
          );
        }
      }

      // 그 외의 경우 (하위 지역이 없는 국내 지역, 해외 지역 등)
      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, selectedLocation]);

  const handleCreatePost = () => {
    // 나중에 새 글 작성 페이지로 이동 추가
    alert("새 모집 게시글 작성 페이지로 이동합니다.");
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
        {filteredPosts.map((post) => (
          <PostListItem key={post.id} post={post} />
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
