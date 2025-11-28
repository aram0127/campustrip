import React, { useState, useEffect } from "react";
import styled, { useTheme } from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { GoogleMap, useJsApiLoader, Marker } from "@react-google-maps/api";
import type { PlannerDetail, PlannerSchedule, PlannerPlace } from "../../types/planner";
import { savePlanner, getPlannerDetail } from "../../api/planners";

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

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderColor};
  background-color: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
`;

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
  background-color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.inputBackground};
  color: ${({ theme, $active }) => $active ? "white" : theme.colors.text};
  white-space: nowrap;
  cursor: pointer;
`;

const PlaceItem = styled.div`
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.inputBackground};
  border-radius: 8px;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: ${({ theme }) => theme.colors.text};
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

function PlannerEditPage() {
  const { id } = useParams(); // id가 있으면 수정 모드, 없으면 생성 모드
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
    { day: 1, places: [] } // 기본 1일차 시작
  ]);
  const [currentDay, setCurrentDay] = useState(1);

  // 수정 모드일 때 데이터 불러오기
  useEffect(() => {
    if (id) {
      getPlannerDetail(Number(id)).then(data => {
        setTitle(data.title);
        setStartDate(data.startDate);
        setEndDate(data.endDate);
        setSchedules(data.schedules);
      });
    }
  }, [id]);

  // 지도 클릭시 장소 추가
  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    
    const newPlace: PlannerPlace = {
      placeName: `장소 ${schedules[currentDay - 1].places.length + 1}`,
      latitude: e.latLng.lat(),
      longitude: e.latLng.lng(),
      order: schedules[currentDay - 1].places.length + 1,
      memo: ""
    };

    const newSchedules = [...schedules];
    newSchedules[currentDay - 1].places.push(newPlace);
    setSchedules(newSchedules);
  };

  // 장소 삭제
  const removePlace = (dayIdx: number, placeIdx: number) => {
    const newSchedules = [...schedules];
    newSchedules[dayIdx].places.splice(placeIdx, 1);
    setSchedules(newSchedules);
  };

  // 일차 추가
  const addDay = () => {
    setSchedules([...schedules, { day: schedules.length + 1, places: [] }]);
  };

  // 저장
  const handleSave = async () => {
    if (!title || !startDate || !endDate) {
      alert("제목과 날짜를 입력해주세요.");
      return;
    }
    
    const plannerData: Partial<PlannerDetail> = {
      title,
      startDate,
      endDate,
      schedules
    };

    await savePlanner(plannerData);
    alert("저장되었습니다.");
    navigate("/planner");
  };

  if (!isLoaded) return <div>Loading...</div>;

  return (
    <Container>
      <TopBar>
        <span onClick={() => navigate(-1)} style={{cursor: "pointer"}}>Example Close</span>
        <SaveButton onClick={handleSave}>저장</SaveButton>
      </TopBar>
      
      <div style={{padding: "16px"}}>
        <Input 
          placeholder="여행 제목" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
        />
        <div style={{display: "flex", gap: "8px"}}>
          <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
      </div>

      <MapContainer>
        <GoogleMap
          mapContainerStyle={{ width: "100%", height: "100%" }}
          center={{ lat: 35.1149, lng: 129.0414 }}
          zoom={10}
          onClick={handleMapClick} // 지도 클릭 이벤트
          options={{ disableDefaultUI: true }}
        >
           {/* 현재 선택된 날짜의 마커만 표시 */}
           {schedules[currentDay - 1]?.places.map((place, idx) => (
             <Marker
               key={idx}
               position={{ lat: place.latitude, lng: place.longitude }}
               label={String(idx + 1)}
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
              onClick={() => setCurrentDay(s.day)}
            >
              {s.day}일차
            </DayButton>
          ))}
          <DayButton $active={false} onClick={addDay}>+ 추가</DayButton>
        </DaySelector>

        <h3>{currentDay}일차 일정</h3>
        {schedules[currentDay - 1]?.places.length === 0 ? (
          <p style={{color: "#888"}}>지도를 클릭해 장소를 추가하세요.</p>
        ) : (
          schedules[currentDay - 1]?.places.map((place, idx) => (
            <PlaceItem key={idx}>
              <span>{idx + 1}. {place.placeName}</span>
              <button onClick={() => removePlace(currentDay - 1, idx)}>삭제</button>
            </PlaceItem>
          ))
        )}
      </ScheduleContainer>
    </Container>
  );
}

export default PlannerEditPage;