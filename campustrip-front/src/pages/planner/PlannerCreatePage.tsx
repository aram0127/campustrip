import React, { useState, useRef, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker, Autocomplete, Polyline } from "@react-google-maps/api";
import { IoSearch } from "react-icons/io5";
import type { PlannerPlace, PlannerSchedule, PlannerDetail } from "../../types/planner";
import { savePlanner } from "../../api/planners";

// 1~8일차 고정 색상
const DAY_COLORS = [
  "#FF5722", "#2196F3", "#4CAF50", "#9C27B0", 
  "#FFC107", "#E91E63", "#00BCD4", "#795548",
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
  max-width: 900px;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const DateRow = styled.div`
  display: flex;
  gap: 8px;
  width: 100%; 
  max-width: 900px;
  align-items: center;
`;

const DateInput = styled.input`
  flex: 1;
  min-width: 0;
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
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
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
  z-index: 20;
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
  padding: 4px 4px 16px 4px;
  margin-bottom: 12px;
`;

const DayButton = styled.button<{ $active: boolean; $color: string }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${({ theme, $active, $color }) => 
    $active ? $color : theme.colors.inputBackground};
  color: ${({ theme, $active }) => 
    $active ? "white" : theme.colors.text};
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

const libraries: ("places")[] = ["places"];

function PlannerCreatePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries, 
  });

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // 전체 일정 데이터
  const [schedules, setSchedules] = useState<PlannerSchedule[]>([
    { day: 1, places: [] }
  ]);
  
  const [currentDay, setCurrentDay] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.9780 }); // 서울 시청
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 일차별 색상 계산 함수
  const getCurrentDayColor = (day: number) => {
    if (day <= DAY_COLORS.length) {
      return DAY_COLORS[day - 1];
    }
    const hue = (day * 137.508) % 360; 
    return `hsl(${hue}, 65%, 50%)`;
  };

  const currentColor = getCurrentDayColor(currentDay);

  // 현재 일차의 장소 목록 (리스트 표시용)
  const currentPlaces = schedules[currentDay - 1]?.places || [];

  // 카테고리 분류 함수
  const getCategoryFromTypes = (types: string[] | undefined): string => {
    if (!types || types.length === 0) return "기타";
    if (types.some(t => ["lodging", "campground", "hotel", "motel", "guest_house"].includes(t))) return "숙소";
    if (types.some(t => ["restaurant", "food", "cafe", "bakery", "bar", "meal_takeaway"].includes(t))) return "맛집/카페";
    if (types.some(t => ["shopping_mall", "department_store", "clothing_store", "convenience_store", "store"].includes(t))) return "쇼핑";
    if (types.some(t => ["tourist_attraction", "amusement_park", "park", "museum", "art_gallery", "landmark", "point_of_interest"].includes(t))) return "명소";
    if (types.some(t => ["airport", "bus_station", "subway_station", "train_station", "transit_station"].includes(t))) return "교통";
    return "기타";
  };

  // 장소 추가 핸들러
  const onPlaceSelected = () => {
    const place = autocompleteRef.current?.getPlace();
    if (!place) return;
    if (!place.geometry || !place.geometry.location) {
        alert(`"${place.name}"에 대한 세부 정보를 찾을 수 없습니다.`);
        return;
    }

    const newPlace: PlannerPlace = {
      placeName: place.name || "알 수 없는 장소",
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      order: schedules[currentDay - 1].places.length + 1,
      category: getCategoryFromTypes(place.types),
      memo: ""
    };
    
    setMapCenter({ lat: newPlace.latitude, lng: newPlace.longitude });

    setSchedules(prevSchedules => 
      prevSchedules.map((schedule, index) => 
        index === currentDay - 1 
          ? { ...schedule, places: [...schedule.places, newPlace] } 
          : schedule
      )
    );
  };

  // 장소 삭제 핸들러
  const removePlace = (dayIdx: number, placeIdx: number) => {
    setSchedules(prevSchedules => {
      const updatedSchedules = prevSchedules.map((schedule, idx) => {
        if (idx !== dayIdx) return schedule;
        const newPlaces = [...schedule.places];
        newPlaces.splice(placeIdx, 1);
        newPlaces.forEach((p, i) => { p.order = i + 1; });
        return { ...schedule, places: newPlaces };
      });
      return updatedSchedules;
    });
  };

  // 일차 추가
  const addDay = () => {
    const nextDay = schedules.length + 1;
    setSchedules([...schedules, { day: nextDay, places: [] }]);
    setCurrentDay(nextDay);
  };

  // 저장
  const handleSave = async () => {
    if (!title.trim()) return alert("여행 제목을 입력하세요.");
    const newPlannerData: Partial<PlannerDetail> = {
      title,
      startDate,
      endDate,
      schedules,
      memberCount: 1,
    };
    try {
      await savePlanner(newPlannerData);
      alert("플래너가 저장되었습니다");
      navigate("/planner"); 
    } catch (error) {
      console.error(error);
      alert("저장 중 오류가 발생했습니다.");
    }
  };

  // 일차 변경 시 지도 이동
  useEffect(() => {
    if (currentPlaces.length > 0) {
      setMapCenter({ 
        lat: currentPlaces[0].latitude, 
        lng: currentPlaces[0].longitude 
      });
    }
  }, [currentDay]); 

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <Container>
      <TopBar>
        <span onClick={() => navigate(-1)} style={{cursor: "pointer"}}>취소</span>
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
          <DateInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span style={{alignSelf: "center", color: "#888"}}>~</span>
          <DateInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </DateRow>
      </InputGroup>

      <MapContainer>
        <SearchBoxWrapper>
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceSelected}
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
          {schedules.map((schedule) => {
            const dayColor = getCurrentDayColor(schedule.day);
            const path = schedule.places.map((p) => ({
              lat: p.latitude,
              lng: p.longitude,
            }));

            return (
              <React.Fragment key={schedule.day}>
                {/* 1. 경로 점선 그리기 */}
                {path.length > 1 && (
                  <Polyline
                    path={path}
                    options={{
                      strokeOpacity: 0, // 실선 숨김
                      icons: [{
                        icon: {
                          path: "M 0,-1 0,1",
                          strokeOpacity: 1,
                          scale: 3,
                          strokeColor: dayColor, // 해당 일차의 색상 적용
                        },
                        offset: "0",
                        repeat: "20px",
                      }],
                      zIndex: 1,
                    }}
                  />
                )}

                {/* 2. 마커 그리기 */}
                {schedule.places.map((place, idx) => (
                  <Marker
                    key={`${schedule.day}-${idx}`}
                    position={{ lat: place.latitude, lng: place.longitude }}
                    label={{ text: String(idx + 1), color: "white", fontWeight: "bold" }}
                    zIndex={2}
                    icon={{
                      path: "M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z",
                      fillColor: dayColor, // 해당 일차 색상 적용
                      fillOpacity: 1,
                      strokeColor: "white",
                      strokeWeight: 2,
                      scale: 1.5,
                      labelOrigin: new google.maps.Point(12, 9),
                      anchor: new google.maps.Point(12, 22),
                    }}
                  />
                ))}
              </React.Fragment>
            );
          })}
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
          <DayButton $active={false} $color="gray" onClick={addDay}>+ 추가</DayButton>
        </DaySelector>

        <div style={{ paddingBottom: "20px" }}>
          {currentPlaces.length === 0 ? (
            <p style={{textAlign: "center", color: "#999", marginTop: "20px"}}>
              검색창을 이용해<br/>일정을 추가하세요
            </p>
          ) : (
            currentPlaces.map((place, idx) => (
              <PlaceItem key={idx}>
                <NumberBadge $color={currentColor}>
                  {idx + 1}
                </NumberBadge>
                <PlaceInfo>
                  <PlaceName>{place.placeName}</PlaceName>
                  <PlaceCategory>{place.category || "기타"}</PlaceCategory>
                </PlaceInfo>
                <DeleteButton onClick={() => removePlace(currentDay - 1, idx)}>삭제</DeleteButton>
              </PlaceItem>
            ))
          )}
        </div>
      </ScheduleContainer>
    </Container>
  );
}

export default PlannerCreatePage;