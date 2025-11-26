import React, { useState, useEffect, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, Polyline } from "@react-google-maps/api";
import { PlannerDetail } from "../../types/planner";

// --- 스타일 정의 (theme.ts 적용) ---

const PageContainer = styled.div`
  width: 100%;
  height: 100vh; /* GlobalStyle의 body height 100%을 상속 */
  display: flex;
  flex-direction: column;
  position: relative;
  background-color: ${({ theme }) => theme.colors.background};
`;

const MapSection = styled.div`
  width: 100%;
  height: 45%; /* 화면 상단 45% */
  flex-shrink: 0;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 24px; /* 바텀시트 느낌 */
  border-top-right-radius: 24px;
  margin-top: -24px; /* 지도를 살짝 덮음 */
  padding: ${({ theme }) => theme.spacings.large} ${({ theme }) => theme.spacings.medium};
  overflow-y: auto;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.large};
  text-align: center;
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.borderColor};
  margin: 0 auto ${({ theme }) => theme.spacings.medium};
  border-radius: 2px;
`;

const Title = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.title};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacings.xsmall};
`;

const Period = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.body};
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

const DaySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacings.large};
`;

const DayTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.subtitle};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacings.medium};
  padding-left: ${({ theme }) => theme.spacings.xxsmall};
`;

// 리스트 아이템: theme.colors.inputBackground 사용 (리스트 페이지와 통일감)
const PlaceItem = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacings.medium};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  margin-bottom: ${({ theme }) => theme.spacings.small};
`;

// 숫자 배지: theme.colors.primary 사용 (브랜드 컬러 강조)
const NumberBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.circle};
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  font-size: ${({ theme }) => theme.fontSizes.caption};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: ${({ theme }) => theme.spacings.medium};
  flex-shrink: 0;
`;

const PlaceName = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.body};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.text};
`;

// --- 더미 데이터 (백엔드 연동 전) ---
const DUMMY_PLANNER: PlannerDetail = {
  plannerId: 1,
  title: "부산 2박 3일 식도락 여행",
  startDate: "2025.09.14",
  endDate: "2025.09.16",
  description: "부산 맛집 뿌시기",
  memberCount: 3,
  user: { id: 1, name: "User1" },
  schedules: [
    {
      day: 1,
      places: [
        { placeId: 1, placeName: "부산역", latitude: 35.1149, longitude: 129.0414, order: 1 },
        { placeId: 2, placeName: "본전돼지국밥", latitude: 35.1155, longitude: 129.0422, order: 2 },
        { placeId: 3, placeName: "광안리 해수욕장", latitude: 35.1532, longitude: 129.1186, order: 3 },
      ],
    },
    {
      day: 2,
      places: [
        { placeId: 4, placeName: "해운대 해수욕장", latitude: 35.1587, longitude: 129.1603, order: 1 },
        { placeId: 5, placeName: "해리단길", latitude: 35.1625, longitude: 129.1630, order: 2 },
      ],
    },
  ],
};

function PlannerDetailPage() {
  const { id } = useParams();
  const theme = useTheme(); // JS 코드(지도 설정) 안에서 테마 값을 쓰기 위해 호출

  // 구글 맵 로드
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  const [planner, setPlanner] = useState<PlannerDetail | null>(null);

  useEffect(() => {
    // 나중에 여기에 API 호출 코드 작성
    setPlanner(DUMMY_PLANNER);
  }, [id]);

  // 지도 경로 좌표 계산
  const pathCoordinates = useMemo(() => {
    if (!planner) return [];
    return planner.schedules.flatMap((schedule) =>
      schedule.places.map((p) => ({ lat: p.latitude, lng: p.longitude }))
    );
  }, [planner]);

  // 지도 로드 시 줌 자동 조절
  const onLoadMap = (map: google.maps.Map) => {
    const bounds = new window.google.maps.LatLngBounds();
    pathCoordinates.forEach((coord) => bounds.extend(coord));
    map.fitBounds(bounds);
  };

  if (!isLoaded || !planner) return <div>로딩 중...</div>;

  return (
    <PageContainer>
      {/* 상단 지도 */}
      <MapSection>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 35.1149, lng: 129.0414 }}
          zoom={10}
          onLoad={onLoadMap}
          options={{ 
            disableDefaultUI: true, // 기본 UI 숨김
            zoomControl: true,      // 줌 버튼은 보이게
          }} 
        >
          {/* 경로 선 그리기 (테마의 Primary 컬러 사용) */}
          <Polyline
            path={pathCoordinates}
            options={{
              strokeColor: theme.colors.primary, // 테마 색상 적용 (#007AFF)
              strokeOpacity: 0.8,
              strokeWeight: 5,
            }}
          />

          {/* 마커 찍기 */}
          {planner.schedules.map((day) =>
            day.places.map((place) => (
              <Marker
                key={place.placeId}
                position={{ lat: place.latitude, lng: place.longitude }}
                label={{
                    text: String(place.order),
                    color: "white",
                    fontWeight: "bold"
                }}
                // 마커 색상 변경은 복잡하므로 일단 기본 빨간 마커 사용
                // 필요시 SVG 아이콘으로 교체 가능
              />
            ))
          )}
        </GoogleMap>
      </MapSection>

      {/* 하단 일정 리스트 */}
      <ContentContainer>
        <Header>
          <HandleBar />
          <Title>{planner.title}</Title>
          <Period>{planner.startDate} ~ {planner.endDate}</Period>
        </Header>

        {planner.schedules.map((schedule) => (
          <DaySection key={schedule.day}>
            <DayTitle>{schedule.day}일차</DayTitle>
            {schedule.places.map((place) => (
              <PlaceItem key={place.placeId}>
                <NumberBadge>{place.order}</NumberBadge>
                <PlaceName>{place.placeName}</PlaceName>
              </PlaceItem>
            ))}
          </DaySection>
        ))}
      </ContentContainer>
    </PageContainer>
  );
}

export default PlannerDetailPage;