import { useState, useRef } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
  GoogleMap,
  useJsApiLoader,
  Marker,
  Autocomplete,
  Polyline,
} from "@react-google-maps/api";
import { IoSearch } from "react-icons/io5";
import type {
  PlannerPlace,
  PlannerSchedule,
  PlannerDetail,
} from "../../types/planner";
import { savePlanner } from "../../api/planners";

// 일차별 색상
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

// 스타일 컴포넌트
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderColor};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const InputGroup = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const TitleInput = styled.input`
  width: 100%;
  max-width: 700px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
  text-align: center;
`;

const DateRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%;
  max-width: 600px;
  align-items: center;
`;

const DateInput = styled.input`
  flex: 1;
  min-width: 0;
  width: 180px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  font-size: 14px;
`;

const SearchWrapper = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background-color: white;
  color: black;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  outline: none;
`;

const SearchIcon = styled(IoSearch)`
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  pointer-events: none;
`;

const MapContainer = styled.div`
  height: 35%;
  width: 100%;
  position: relative;
`;

const SearchBoxWrapper = styled.div`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 90%;
  max-width: 400px;
  z-index: 50;
`;

const ScheduleContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.background};
`;

const DaySelector = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 4px 12px 4px;
  margin-bottom: 12px;
`;

const DayButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${({ theme, $active, $color }) =>
    $active ? $color : theme.colors.inputBackground};
  color: ${({ theme, $active }) => ($active ? "white" : theme.colors.text)};
  white-space: nowrap;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
`;

const PlaceItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  margin-bottom: 10px;
  gap: 10px;
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
  flex-shrink: 0;
`;

const PlaceInfo = styled.div`
  flex: 1;
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

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error || "#ff3b30"};
  font-size: 12px;
  cursor: pointer;
  white-space: nowrap;
`;

const SaveButton = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
`;

const libraries: "places"[] = ["places"];

function PlannerCreatePage() {
  const navigate = useNavigate();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries,
    language: "ko",
  });

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState<PlannerSchedule[]>([
    { day: 1, places: [] },
  ]);
  const [currentDay, setCurrentDay] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 초기 좌표: 서울 시청
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const getCurrentDayColor = (day: number) => {
    if (day <= DAY_COLORS.length) {
      return DAY_COLORS[day - 1];
    }
    const hue = (day * 137.508) % 360;
    return `hsl(${hue}, 65%, 50%)`;
  };

  const currentColor = getCurrentDayColor(currentDay);

  const pathCoordinates =
    schedules[currentDay - 1]?.places.map((place) => ({
      lat: place.latitude,
      lng: place.longitude,
    })) || [];

  // 점선 스타일 정의
  const lineSymbol = {
    path: "M 0,-1 0,1",
    strokeOpacity: 1,
    scale: 3,
    strokeColor: currentColor,
  };

  const getCategoryFromTypes = (types: string[] | undefined): string => {
    if (!types) return "기타";
    if (types.includes("lodging")) return "숙소";
    if (
      types.includes("restaurant") ||
      types.includes("food") ||
      types.includes("cafe")
    )
      return "맛집/카페";
    if (
      types.includes("tourist_attraction") ||
      types.includes("museum") ||
      types.includes("park")
    )
      return "명소";
    if (types.includes("transit_station") || types.includes("airport"))
      return "교통";
    if (types.includes("shopping_mall") || types.includes("store"))
      return "쇼핑";
    return "기타";
  };

  const onPlaceSelected = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;
    if (!place.geometry || !place.geometry.location) {
      alert(
        `"${place.name}"에 대한 세부 정보를 찾을 수 없습니다.\n자동완성 목록에서 장소를 클릭하세요.`
      );
      return;
    }
    
    // 위도 경로 확인용
    console.log("================ 확인 시작 ================");
    console.log("장소 이름:", place.name);
    console.log("Place ID:", place.place_id);
    console.log("위도(lat):", place.geometry.location.lat());
    console.log("경도(lng):", place.geometry.location.lng());
    console.log("================ 확인 끝 ================");

    const newPlace: PlannerPlace = {
      placeName: place.name || "알 수 없는 장소",
      placeId: place.place_id || "",
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      order: schedules[currentDay - 1].places.length + 1,
      category: getCategoryFromTypes(place.types),
      memo: "",
    };

    setMapCenter({ lat: newPlace.latitude, lng: newPlace.longitude });

    // 불변성 유지하며 업데이트
    const newSchedules = [...schedules];
    newSchedules[currentDay - 1].places.push(newPlace);
    setSchedules(newSchedules);
  };

  const removePlace = (dayIdx: number, placeIdx: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIdx].places.splice(placeIdx, 1);
    newSchedules[dayIdx].places.forEach((p, idx) => {
      p.order = idx + 1;
    });
    setSchedules(newSchedules);
  };

  const addDay = () => {
    setSchedules([...schedules, { day: schedules.length + 1, places: [] }]);
    setCurrentDay(schedules.length + 1);
  };

  const handleSave = async () => {
    if (!title.trim()) return alert("여행 제목을 입력하세요."); // 제목 검사
    if (!startDate || !endDate) return alert("여행 기간을 선택해주세요."); // 날짜 검사
    
    const newPlannerData: Partial<PlannerDetail> = {
      title,
      startDate,
      endDate,
      schedules,
      memberCount: 1,
    };

    try {
      console.log("전송 데이터 확인:", newPlannerData);
      await savePlanner(newPlannerData);
      alert("플래너가 저장되었습니다");
      navigate("/planner");
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <Container>
      <TopBar>
        <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
          취소
        </span>
        <h3>새 플래너</h3>
        <SaveButton onClick={handleSave}>완료</SaveButton>
      </TopBar>

      <InputGroup>
        <TitleInput
          placeholder="어떤 여행을 떠나시나요?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <DateRow>
          <DateInput
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <span style={{ alignSelf: "center", color: "#888" }}>~</span>
          <DateInput
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </DateRow>
      </InputGroup>

      <MapContainer>
        <SearchBoxWrapper>
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceSelected}
            options={{
              fields: [
                "name",
                "geometry",
                "types",
                "formatted_address",
                "place_id",
              ],
              componentRestrictions: { country: "kr" },
              language: "ko",
            }}
          >
            <SearchWrapper>
              <SearchInput placeholder="장소를 검색해서 추가하세요" />
              <SearchIcon />
            </SearchWrapper>
          </Autocomplete>
        </SearchBoxWrapper>

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={12}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
          {/* 점선 그리기 - 경로가 있을 때만 렌더링 */}
          {pathCoordinates.length > 1 && (
            <Polyline
              path={pathCoordinates}
              options={{
                strokeOpacity: 0, // 실선 숨김
                icons: [
                  {
                    icon: lineSymbol,
                    offset: "0",
                    repeat: "20px", // 점선 간격
                  },
                ],
                zIndex: 1, // 마커 뒤에 위치
              }}
            />
          )}

          {schedules[currentDay - 1]?.places.map((place, idx) => (
            <Marker
              key={`${currentDay}-${idx}`} // key를 고유하게 변경하여 리렌더링 이슈 방지
              position={{ lat: place.latitude, lng: place.longitude }}
              label={{
                text: String(idx + 1),
                color: "white",
                fontWeight: "bold",
              }}
              zIndex={2}
              icon={{
                path: "M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z",
                fillColor: currentColor,
                fillOpacity: 1,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 1.5,
                labelOrigin: new google.maps.Point(12, 9),
                anchor: new google.maps.Point(12, 22),
              }}
            />
          ))}
        </GoogleMap>
      </MapContainer>

      <ScheduleContainer>
        <DaySelector>
          {schedules.map((s) => (
            <DayButton
              key={s.day}
              $active={currentDay === s.day}
              $color={getCurrentDayColor(s.day)}
              onClick={() => setCurrentDay(s.day)}
            >
              {s.day}일차
            </DayButton>
          ))}
          <DayButton $active={false} $color="gray" onClick={addDay}>
            + 추가
          </DayButton>
        </DaySelector>

        <div style={{ paddingBottom: "20px" }}>
          {schedules[currentDay - 1]?.places.length === 0 ? (
            <p
              style={{ textAlign: "center", color: "#999", marginTop: "20px" }}
            >
              검색창을 이용해
              <br />
              일정을 추가하세요
            </p>
          ) : (
            schedules[currentDay - 1]?.places.map((place, idx) => (
              <PlaceItem key={idx}>
                <NumberBadge $color={currentColor}>{idx + 1}</NumberBadge>
                <PlaceInfo>
                  <PlaceName>{place.placeName}</PlaceName>
                  <PlaceCategory>{place.category || "기타"}</PlaceCategory>
                </PlaceInfo>
                <DeleteButton onClick={() => removePlace(currentDay - 1, idx)}>
                  삭제
                </DeleteButton>
              </PlaceItem>
            ))
          )}
        </div>
      </ScheduleContainer>
    </Container>
  );
}

export default PlannerCreatePage;
