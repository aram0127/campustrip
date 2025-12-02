import React, { useState, useEffect, useMemo, useRef } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
import { IoCreateOutline } from "react-icons/io5";
import type {
  PlannerDetailResponse,
  PlannerDetailDTO,
  PlannerSchedule,
  PlannerPlace,
} from "../../types/planner";
import { getPlannerDetail } from "../../api/planners";

// 일차별 색상
const DAY_COLORS = [
  "#FF5722",
  "#2196F3",
  "#4CAF50",
  "#9C27B0",
  "#FFC107",
  "#E91E63",
  "#00BCD4",
  "#795548",
];

const libraries: "places"[] = ["places"];

const ViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden; /* 드래그 중 스크롤 방지 */
`;

// 높이를 props로 받거나 style로 제어하기 위해 수정
const MapSection = styled.div`
  width: 100%;
  /* height는 인라인 스타일로 제어합니다 */
  flex-shrink: 0;
  position: relative;
  transition: height 0.1s ease-out; /* 부드러운 움직임 */
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  background-color: ${({ theme }) => theme.colors.background};
  border-top-left-radius: 24px;
  border-top-right-radius: 24px;
  margin-top: -24px; /* 지도를 살짝 덮는 효과 */
  padding: 0 20px 24px 20px; /* 상단 padding 제거하고 HandleZone에서 처리 */
  display: flex;
  flex-direction: column;
  z-index: 10;
  box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
  overflow: hidden; /* 내부 스크롤을 위해 hidden 처리 후 아래 List에서 auto */
`;

// 드래그를 위한 터치 영역 (실제 HandleBar보다 넓게 잡음)
const HandleZone = styled.div`
  width: 100%;
  padding: 24px 0 10px 0; /* 시각적 여백 */
  display: flex;
  justify-content: center;
  cursor: grab;
  touch-action: none; /* 브라우저 기본 터치 액션 방지 */

  &:active {
    cursor: grabbing;
  }
`;

const HandleBar = styled.div`
  width: 40px;
  height: 4px;
  background-color: ${({ theme }) => theme.colors.borderColor};
  border-radius: 2px;
`;

// 내용이 많을 경우 스크롤 되도록 감싸는 영역
const ScrollableContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding-bottom: 20px;

  /* 스크롤바 숨기기 (선택사항) */
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Header = styled.div`
  margin-bottom: 20px;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
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
  margin: 0;
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
  width: 100%;
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

const Message = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.secondaryTextColor};
`;

interface PlannerViewerProps {
  plannerId: number;
  showEditButton?: boolean;
}

const PlannerViewer: React.FC<PlannerViewerProps> = ({
  plannerId,
  showEditButton = false,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [mapHeightPercent, setMapHeightPercent] = useState(45);
  const startY = useRef<number>(0);
  const startHeight = useRef<number>(0);

  const [planner, setPlanner] = useState<PlannerDetailResponse | null>(null);
  const [schedulePlaces, setSchedulePlaces] = useState<PlannerSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: libraries,
    language: "ko",
  });

  const getCategoryFromTypes = (types: string[] | undefined): string => {
    if (!types || types.length === 0) return "기타";
    if (
      types.some((t) =>
        ["lodging", "campground", "hotel", "motel", "guest_house"].includes(t)
      )
    )
      return "숙소";
    if (
      types.some((t) =>
        [
          "restaurant",
          "food",
          "cafe",
          "bakery",
          "bar",
          "meal_takeaway",
        ].includes(t)
      )
    )
      return "맛집/카페";
    if (
      types.some((t) =>
        [
          "shopping_mall",
          "department_store",
          "clothing_store",
          "convenience_store",
          "store",
        ].includes(t)
      )
    )
      return "쇼핑";
    if (
      types.some((t) =>
        [
          "tourist_attraction",
          "amusement_park",
          "park",
          "museum",
          "art_gallery",
          "landmark",
          "point_of_interest",
        ].includes(t)
      )
    )
      return "명소";
    if (
      types.some((t) =>
        [
          "airport",
          "bus_station",
          "subway_station",
          "train_station",
          "transit_station",
        ].includes(t)
      )
    )
      return "교통";
    return "기타";
  };

  const getDayColor = (day: number) => {
    return DAY_COLORS[(day - 1) % DAY_COLORS.length];
  };

  useEffect(() => {
    if (!plannerId || !isLoaded) return;

    const fetchDetails = async () => {
      try {
        setIsLoading(true);
        const plannerData: PlannerDetailResponse = await getPlannerDetail(
          plannerId
        );
        setPlanner(plannerData);

        const detailList = plannerData.details || [];

        if (detailList.length === 0) {
          setSchedulePlaces([]);
          setIsLoading(false);
          return;
        }

        const service = new google.maps.places.PlacesService(
          document.createElement("div")
        );

        const placeDetailPromises = detailList.map(
          (scheduleItem: PlannerDetailDTO) =>
            new Promise<({ day: number } & PlannerPlace) | null>((resolve) => {
              service.getDetails(
                {
                  placeId: scheduleItem.googlePlaceId,
                  fields: ["name", "geometry", "types"],
                },
                (place, status) => {
                  if (
                    status === google.maps.places.PlacesServiceStatus.OK &&
                    place?.geometry?.location
                  ) {
                    const placeInfo: PlannerPlace = {
                      googlePlaceId: scheduleItem.googlePlaceId,
                      placeName: place.name || "알 수 없는 장소",
                      latitude: place.geometry.location.lat(),
                      longitude: place.geometry.location.lng(),
                      order: scheduleItem.plannerOrder,
                      category: getCategoryFromTypes(place.types),
                      memo: "",
                    };
                    resolve({ ...placeInfo, day: scheduleItem.day });
                  } else {
                    resolve(null);
                  }
                }
              );
            })
        );

        const resolvedPlaces = await Promise.all(placeDetailPromises);

        const finalSchedules = resolvedPlaces
          .filter((p): p is { day: number } & PlannerPlace => p !== null)
          .reduce((acc, current) => {
            const day = current.day;
            let schedule = acc.find((s) => s.day === day);
            if (!schedule) {
              schedule = { day, places: [] };
              acc.push(schedule);
            }
            schedule.places.push(current);
            return acc;
          }, [] as PlannerSchedule[])
          .sort((a, b) => a.day - b.day);

        finalSchedules.forEach((schedule) => {
          schedule.places.sort((a, b) => a.order - b.order);
        });

        setSchedulePlaces(finalSchedules);
      } catch (err) {
        console.error("플래너 정보 로드 실패:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDetails();
  }, [plannerId, isLoaded]);

  const pathCoordinates = useMemo(() => {
    if (!schedulePlaces) return [];
    return schedulePlaces.flatMap((schedule) =>
      schedule.places.map((p) => ({ lat: p.latitude, lng: p.longitude }))
    );
  }, [schedulePlaces]);

  const handleEdit = () => {
    navigate(`/planner/edit/${plannerId}`);
  };

  // 드래그 핸들러
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    // 터치 혹은 마우스 시작 지점 저장
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    startY.current = clientY;
    startHeight.current = mapHeightPercent;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if ("buttons" in e && e.buttons !== 1) return;

    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    const deltaY = clientY - startY.current; // 이동한 거리 (아래로 +, 위로 -)

    // 전체 화면 높이 대비 이동 비율 계산
    const windowHeight = window.innerHeight;
    const deltaPercent = (deltaY / windowHeight) * 100;

    // 핸들바를 아래로 내리면(+, deltaY > 0) -> 지도가 커져야 함 (mapHeight 증가)
    // 핸들바를 위로 올리면(-, deltaY < 0) -> 지도가 작아져야 함 (mapHeight 감소)
    let newHeight = startHeight.current + deltaPercent;

    // 최소/최대 높이 제한 (예: 최소 10%, 최대 85%)
    if (newHeight < 10) newHeight = 10;
    if (newHeight > 85) newHeight = 85;

    setMapHeightPercent(newHeight);
  };

  if (!isLoaded || isLoading) {
    return <Message>플래너 정보를 불러오는 중...</Message>;
  }

  if (schedulePlaces.length === 0) {
    return <Message>등록된 상세 일정이 없습니다.</Message>;
  }

  return (
    <ViewerContainer>
      <MapSection style={{ height: `${mapHeightPercent}%` }}>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={pathCoordinates[0] || { lat: 37.5665, lng: 126.978 }}
          zoom={10}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
          {/* 경로 표시 (Polyline) */}
          {schedulePlaces.map((schedule) => {
            const dayColor = getDayColor(schedule.day);
            const path = (schedule.places || []).map((p) => ({
              lat: p.latitude,
              lng: p.longitude,
            }));

            if (path.length < 2) return null;

            return (
              <Polyline
                key={`polyline-${schedule.day}`}
                path={path}
                options={{
                  strokeOpacity: 0,
                  icons: [
                    {
                      icon: {
                        path: "M 0,-1 0,1",
                        strokeOpacity: 1,
                        scale: 3,
                        strokeColor: dayColor,
                      },
                      offset: "0",
                      repeat: "20px",
                    },
                  ],
                  zIndex: 1,
                }}
              />
            );
          })}

          {/* 마커 표시 */}
          {schedulePlaces.map((schedule) =>
            schedule.places.map((place) => (
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
        <HandleZone
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onMouseDown={handleTouchStart}
          onMouseMove={handleTouchMove}
        >
          <HandleBar />
        </HandleZone>

        <ScrollableContent>
          {planner && (
            <Header>
              <TitleRow>
                <Title>{planner.title}</Title>
                {showEditButton && (
                  <ButtonGroup>
                    <IconButton onClick={handleEdit} title="수정">
                      <IoCreateOutline />
                    </IconButton>
                  </ButtonGroup>
                )}
              </TitleRow>
              <Period>
                📅 {planner.startDate} ~ {planner.endDate}
              </Period>
            </Header>
          )}
          {schedulePlaces.map((schedule) => {
            const dayColor = getDayColor(schedule.day);
            return (
              <DaySection key={schedule.day}>
                <DayTitle $color={dayColor}>{schedule.day}일차</DayTitle>
                {schedule.places.map((place) => (
                  <PlaceItem key={place.order}>
                    <NumberBadge $color={dayColor}>{place.order}</NumberBadge>
                    <PlaceContent>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <PlaceName>{place.placeName}</PlaceName>
                        <PlaceCategory>{place.category}</PlaceCategory>
                      </div>
                      {place.memo && <PlaceMemo>{place.memo}</PlaceMemo>}
                    </PlaceContent>
                  </PlaceItem>
                ))}
              </DaySection>
            );
          })}
        </ScrollableContent>
      </ContentContainer>
    </ViewerContainer>
  );
};

export default PlannerViewer;
