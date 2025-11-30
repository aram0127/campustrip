import { useState, useEffect, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { IoArrowBack, IoCreateOutline, IoTrashOutline } from "react-icons/io5"; // 아이콘 추가
import type { PlannerDetail } from "../../types/planner";
import { getPlannerDetail, deletePlanner } from "../../api/planners";

// 일차별 색상 (생성 페이지와 통일)
const DAY_COLORS = [
  "#FF5722", // 1일차: 주황
  "#2196F3", // 2일차: 파랑
  "#4CAF50", // 3일차: 초록
  "#9C27B0", // 4일차: 보라
  "#FFC107", // 5일차: 노랑
  "#E91E63", // 6일차: 분홍
  "#00BCD4", // 7일차: 하늘
  "#795548", // 8일차: 갈색
];

const libraries: "places"[] = ["places"];

const PageContainer = styled.div`
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

// 상단 네비게이션 바 추가
const TopBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 20;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent); /* 지도 위에서 잘 보이게 */
`;

const BackButton = styled.button`
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  font-size: 20px;
  color: #333;
`;

const MapSection = styled.div`
  width: 100%;
  height: 45%;
  flex-shrink: 0;
  position: relative;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  margin-top: -24px;
  padding: 24px 20px;
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: 20px;
  position: relative;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.borderColor};
  margin: 0 auto 16px;
  border-radius: 2px;
`;

const Title = styled.h2`
  font-size: 22px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  flex: 1;
`;

const Period = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  display: flex;
  align-items: center;
  gap: 6px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  cursor: pointer;
  padding: 4px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const DaySection = styled.div`
  margin-bottom: 24px;
`;

const DayTitle = styled.h3<{ $color: string }>`
  font-size: 16px;
  font-weight: 700;
  color: ${({ $color }) => $color};
  margin-bottom: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  padding-bottom: 8px;
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: flex-start;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  margin-bottom: 8px;
`;

const NumberBadge = styled.div<{ $color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;
  margin-top: 2px;
`;

const PlaceContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const PlaceName = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
`;

const PlaceCategory = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
  margin-top: 2px;
`;

const PlaceMemo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.background};
  padding: 8px;
  border-radius: 8px;
  margin-top: 8px;
  white-space: pre-wrap;
`;

function PlannerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const theme = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    language: "ko",
  });

  const [planner, setPlanner] = useState<PlannerDetail | null>(null);

  useEffect(() => {
    if (id) {
      getPlannerDetail(Number(id))
        .then(setPlanner)
        .catch((err) => {
          console.error(err);
          alert("플래너 정보를 불러오지 못했습니다.");
          navigate("/planner");
        });
    }
  }, [id, navigate]);

  const pathCoordinates = useMemo(() => {
    // planner가 없거나 schedules가 없으면 빈 배열 반환 
    if (!planner || !planner.schedules) return [];

    return planner.schedules.flatMap((schedule) =>
      // places가 없을 수도 있으니 안전하게 처리
      (schedule.places || []).map((p) => ({ lat: p.latitude, lng: p.longitude }))
    );
  }, [planner]);

  const handleDelete = async () => {
    if (window.confirm("정말 이 플래너를 삭제하시겠습니까?")) {
      try {
        await deletePlanner(Number(id));
        alert("삭제되었습니다.");
        navigate("/planner");
      } catch (e) {
        alert("삭제 중 오류가 발생했습니다.");
      }
    }
  };

  const handleEdit = () => {
    navigate(`/planner/edit/${id}`); 
  };

  const getDayColor = (day: number) => {
    return DAY_COLORS[(day - 1) % DAY_COLORS.length];
  };

  if (!isLoaded || !planner) return <div>Loading...</div>;

  return (
    <PageContainer>
      {/* 뒤로가기 버튼 영역 */}
      <TopBar>
        <BackButton onClick={() => navigate(-1)}>
          <IoArrowBack />
        </BackButton>
      </TopBar>

      <MapSection>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={pathCoordinates[0] || { lat: 37.5665, lng: 126.9780 }}
          zoom={12}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
          {/* 전체 경로 실선 */}
          <Polyline
            path={pathCoordinates}
            options={{ strokeColor: theme.colors.primary, strokeWeight: 4, strokeOpacity: 0.7 }}
          />

          {/* schedules이 있을 때만 지도 마커 렌더링 */}
          {planner.schedules?.map((schedule) =>
          (schedule.places || []).map((place) => (
              <Marker
                key={`${schedule.day}-${place.order}`}
                position={{ lat: place.latitude, lng: place.longitude }}
                label={{
                  text: String(place.order),
                  color: "white",
                  fontWeight: "bold",
                }}
                icon={{
                  path: "M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z",
                  fillColor: getDayColor(schedule.day),
                  fillOpacity: 1,
                  strokeColor: "white",
                  strokeWeight: 2,
                  scale: 1.5,
                  labelOrigin: new google.maps.Point(12, 9),
                  anchor: new google.maps.Point(12, 22),
                }}
              />
            ))
          )}
        </GoogleMap>
      </MapSection>

      <ContentContainer>
        <HandleBar />
        <Header>
          <TitleRow>
            <Title>{planner.title}</Title>
            <ButtonGroup>
              <IconButton onClick={handleEdit} title="수정">
                <IoCreateOutline />
              </IconButton>
              <IconButton onClick={handleDelete} title="삭제">
                <IoTrashOutline />
              </IconButton>
            </ButtonGroup>
          </TitleRow>
          
          <Period>
            📅 {planner.startDate} ~ {planner.endDate}
          </Period>
        </Header>

        {/* schedules 데이터가 아예 없을 때 '일정 없음' 표시 */}
        {(!planner.schedules || planner.schedules.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                <p>등록된 상세 일정이 없습니다.</p>
            </div>
        ) : (
            planner.schedules.map((schedule) => {
            const dayColor = getDayColor(schedule.day);
            return (
                <DaySection key={schedule.day}>
                <DayTitle $color={dayColor}>{schedule.day}일차</DayTitle>
                {(!schedule.places || schedule.places.length === 0) ? (
                    <p style={{ color: "#999", fontSize: "14px", padding: "8px" }}>일정이 없습니다.</p>
                ) : (
                    schedule.places.map((place) => (
                    <PlaceItem key={place.order}>
                        <NumberBadge $color={dayColor}>{place.order}</NumberBadge>
                        <PlaceContent style={{ width: "100%" }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <PlaceName>{place.placeName}</PlaceName>
                            <PlaceCategory>{place.category}</PlaceCategory>
                        </div>
                        {place.memo && <PlaceMemo>{place.memo}</PlaceMemo>}
                        </PlaceContent>
                    </PlaceItem>
                    ))
                )}
                </DaySection>
            );
            })
        )}
      </ContentContainer>
    </PageContainer>
  );
}

export default PlannerDetailPage;
