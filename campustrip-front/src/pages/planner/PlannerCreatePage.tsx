import React, { useState } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { PlannerPlace, PlannerSchedule, PlannerDetail } from "../../types/planner";
import { savePlanner } from "../../api/planners";

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

const TitleInput = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  font-size: 16px;
  font-weight: bold;
`;

const DateInput = styled.input`
  flex: 1;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

// 검색창 스타일 
const SearchInput = styled.input`
  width: 100%;
  padding: 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.primary};
  background-color: white;
  color: black;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  z-index: 10;
`;

const MapContainer = styled.div`
  height: 35%;
  width: 100%;
  position: relative; 
`;

// 검색창 위치
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
  padding-bottom: 12px;
  margin-bottom: 12px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ theme, $active }) => 
    $active ? "white" : theme.colors.text};
  white-space: nowrap;
  cursor: pointer;
  font-weight: 500;
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

const NumberBadge = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #FF5722;
  color: white;
  font-size: 12px;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
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

// 구글 API 라이브러리 설정 
const libraries: ("places")[] = ["places"];

function PlannerCreatePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries, // places 라이브러리 사용 
  });

  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState<PlannerSchedule[]>([
    { day: 1, places: [] }
  ]);
  const [currentDay, setCurrentDay] = useState(1);
  const [mapCenter, setMapCenter] = useState({ lat: 35.1149, lng: 129.0414 });

  // 검색창 제어용 변수 
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // 구글 카테고리 변환 
  const getCategoryFromTypes = (types: string[] | undefined): string => {
    if (!types) return "기타";
    if (types.includes("lodging")) return "숙소";
    if (types.includes("restaurant") || types.includes("food") || types.includes("cafe")) return "맛집/카페";
    if (types.includes("tourist_attraction") || types.includes("museum") || types.includes("park")) return "명소";
    if (types.includes("transit_station") || types.includes("airport")) return "교통";
    if (types.includes("shopping_mall") || types.includes("store")) return "쇼핑";
    return "기타";
  };

  // 장소 검색 완료 시 실행되는 함수
  const onPlaceSelected = () => {
    const place = autocompleteRef.current?.getPlace();
    
    if (!place || !place.geometry || !place.geometry.location) {
      alert("장소 정보를 가져올 수 없습니다.");
      return;
    }

    const newPlace: PlannerPlace = {
      placeName: place.name || "알 수 없는 장소",
      latitude: place.geometry.location.lat(),
      longitude: place.geometry.location.lng(),
      order: schedules[currentDay - 1].places.length + 1,
      googlePlaceId: place.place_id, // 구글 ID 저장
      category: getCategoryFromTypes(place.types), // 카테고리 자동 분류
      memo: ""
    };
    
    setMapCenter({ lat: newPlace.latitude, lng: newPlace.longitude });

    const newSchedules = [...schedules];
    newSchedules[currentDay - 1].places.push(newPlace);
    setSchedules(newSchedules);
  };

  const removePlace = (dayIdx: number, placeIdx: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIdx].places.splice(placeIdx, 1);
    newSchedules[dayIdx].places.forEach((p, idx) => { p.order = idx + 1; });
    setSchedules(newSchedules);
  };

  const addDay = () => {
    setSchedules([...schedules, { day: schedules.length + 1, places: [] }]);
    setCurrentDay(schedules.length + 1);
  };

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
        <div style={{display: "flex", gap: "8px"}}>
          <DateInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <span style={{alignSelf: "center"}}>~</span>
          <DateInput type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </InputGroup>

      <MapContainer>
        {/* 검색창 */}
        <SearchBoxWrapper>
          <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={onPlaceSelected}
          >
            <SearchInput placeholder="장소를 검색해서 추가하세요" />
          </Autocomplete>
        </SearchBoxWrapper>

        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={mapCenter}
          zoom={12}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
           {schedules[currentDay - 1]?.places.map((place, idx) => (
             <Marker
               key={idx}
               position={{ lat: place.latitude, lng: place.longitude }}
               label={{ text: String(idx + 1), color: "white", fontWeight: "bold" }}
             />
           ))}
        </GoogleMap>
      </MapContainer>
    // 지도 이동

const MapContainer = styled.div`
  height: 40%;
  width: 100%;
`;

const ScheduleContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const DaySelector = styled.div`
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 12px;
`;

const DayButton = styled.button<{ $active: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background-color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ theme, $active }) => 
    $active ? "white" : theme.colors.text};
  white-space: nowrap;
  cursor: pointer;
  font-weight: 500;
`;

const PlaceItem = styled.div`
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 12px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const PlaceText = styled.span`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.error || "#ff3b30"};
  font-size: 12px;
  cursor: pointer;
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

function PlannerCreatePage() {
  const navigate = useNavigate();
  const theme = useTheme();

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // 상태 관리 
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [schedules, setSchedules] = useState<PlannerSchedule[]>([
    { day: 1, places: [] } // 기본적으로 1일차 생성
  ]);
  const [currentDay, setCurrentDay] = useState(1);

  // 지도 클릭 핸들러 (마커 추가) 
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    // 선택된 날짜의 일정에 장소 추가
    const currentScheduleIndex = currentDay - 1;
    const newPlace: PlannerPlace = {
      placeName: `새로운 장소 ${schedules[currentScheduleIndex].places.length + 1}`,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
      order: schedules[currentScheduleIndex].places.length + 1,
      memo: ""
    };

    const newSchedules = [...schedules];
    newSchedules[currentScheduleIndex].places.push(newPlace);
    setSchedules(newSchedules);
  };

  // 장소 삭제
  const removePlace = (dayIdx: number, placeIdx: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIdx].places.splice(placeIdx, 1);
    
    // 순서 재정렬
    newSchedules[dayIdx].places.forEach((p, idx) => {
      p.order = idx + 1;
    });
    
    setSchedules(newSchedules);
  };

  // 일차 추가 
  const addDay = () => {
    setSchedules([...schedules, { day: schedules.length + 1, places: [] }]);
    setCurrentDay(schedules.length + 1); // 추가된 날짜로 탭 이동
  };

  // 저장 버튼 클릭
  const handleSave = async () => {
    if (!title.trim()) return alert("여행 제목을 입력하세요.");
    if (!startDate || !endDate) return alert("여행 기간을 선택하세요.");

    const newPlannerData: Partial<PlannerDetail> = {
      title,
      startDate,
      endDate,
      schedules,
      memberCount: 1, // 기본값
    };

    // API 호출
    try {
      await savePlanner(newPlannerData);
      alert("플래너가 생성되었습니다.");
      navigate("/planner"); // 리스트로 이동
    } catch (error) {
      console.error(error);
      alert("저장에 실패했습니다.");
    }
  };

  if (!isLoaded) return <div>지도를 불러오는 중...</div>;

  return (
    <Container>
      {/* 상단 바 */}
      <TopBar>
        <span onClick={() => navigate(-1)} style={{cursor: "pointer", fontSize: "14px"}}>취소</span>
        <h3 style={{fontSize: "16px", margin: 0}}>새 플래너</h3>
        <SaveButton onClick={handleSave}>완료</SaveButton>
      </TopBar>
      
      {/* 입력 섹션 */}
      <div style={{padding: "16px"}}>
        <TitleInput 
          placeholder="어떤 여행을 떠나시나요?" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div style={{display: "flex", gap: "8px"}}>
          <DateInput 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)} 
          />
          <span style={{alignSelf: "center"}}>~</span>
          <DateInput 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)} 
          />
        </div>
      </div>

      {/* 지도 섹션 */}
      <MapContainer>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 37.5665, lng: 126.9780 }} // 초기 중심 좌표 (서울)
          zoom={11}
          onClick={handleMapClick}
          options={{ disableDefaultUI: true, clickableIcons: false }}
        >
           {/* 현재 선택된 날짜의 마커만 지도에 표시 */}
           {schedules[currentDay - 1]?.places.map((place, idx) => (
             <Marker
               key={idx}
               position={{ lat: place.latitude, lng: place.longitude }}
               label={{ text: String(idx + 1), color: "white", fontWeight: "bold" }}
             />
           ))}
        </GoogleMap>
      </MapContainer>

      {/* 일정 섹션 */}
      <ScheduleContainer>
        {/* 날짜 선택 탭 */}
        <DaySelector>
          {schedules.map((s) => (
            <DayButton 
              key={s.day} 
              $active={currentDay === s.day}
              onClick={() => setCurrentDay(s.day)}
            >
              {s.day}일차
            </DayButton>
          ))}
          <DayButton $active={false} onClick={addDay}>+ 추가</DayButton>
        </DaySelector>

        {/* 선택된 날짜의 장소 리스트 */}
        <h4 style={{margin: "0 0 12px 0"}}>{currentDay}일차 일정</h4>
        
        {schedules[currentDay - 1]?.places.length === 0 ? (
          <p style={{color: "#999", textAlign: "center", fontSize: "14px", marginTop: "20px"}}>
            지도에서 원하는 장소를 클릭해<br/>일정을 추가하세요
          </p>
        ) : (
          schedules[currentDay - 1]?.places.map((place, idx) => (
            <PlaceItem key={idx}>
              <PlaceText>{idx + 1}. {place.placeName}</PlaceText>
              <DeleteButton onClick={() => removePlace(currentDay - 1, idx)}>삭제</DeleteButton>
            </PlaceItem>
          ))
        )}
      </ScheduleContainer>
    </Container>
  );
}

export default PlannerCreatePage;