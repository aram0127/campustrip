import React, { useState, useEffect, useMemo } from "react";
import styled, { useTheme } from "styled-components";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Polyline,
} from "@react-google-maps/api";
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
`;

const MapSection = styled.div`
  width: 100%;
  height: 300px;
  flex-shrink: 0;
  position: relative;
`;

const ScheduleListContainer = styled.div`
  flex-grow: 1;
  padding: 20px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.background};
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
}

const PlannerViewer: React.FC<PlannerViewerProps> = ({ plannerId }) => {
  const theme = useTheme();

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

  if (!isLoaded || isLoading) {
    return <Message>플래너 정보를 불러오는 중...</Message>;
  }

  if (schedulePlaces.length === 0) {
    return <Message>등록된 상세 일정이 없습니다.</Message>;
  }

  return (
    <ViewerContainer>
      <MapSection>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={pathCoordinates[0] || { lat: 37.5665, lng: 126.978 }}
          zoom={10}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
          <Polyline
            path={pathCoordinates}
            options={{
              strokeColor: theme.colors.primary,
              strokeWeight: 4,
              strokeOpacity: 0.7,
            }}
          />
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

      <ScheduleListContainer>
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
      </ScheduleListContainer>
    </ViewerContainer>
  );
};

export default PlannerViewer;
