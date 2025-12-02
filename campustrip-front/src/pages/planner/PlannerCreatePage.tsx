import React, { useState, useRef, useMemo } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Autocomplete,
    Polyline,
} from "@react-google-maps/api";
import { IoSearch, IoTrashOutline, IoArrowBack } from "react-icons/io5";
import type {
    PlannerPlace,
    PlannerSchedule,
} from "../../types/planner";
import { savePlanner } from "../../api/planners";

interface PlannerDetailRequestDTO {
    plannerOrder: number; 
    day: number; 
    googlePlaceId: string; 
}

// 전체 저장 요청 Body 구조 
interface PlannerCreateRequest {
    title: string;
    startDate: string;
    endDate: string;
    memberCount: number;
    schedules: PlannerDetailRequestDTO[]; 
}

// 일차별 색상
const DAY_COLORS = [
    "#FF5722", "#2196F3", "#4CAF50", "#9C27B0",
    "#FFC107", "#E91E63", "#00BCD4", "#795548",
];

// 날짜 일수 더하거나 빼는 함수
const addDaysToDateString = (dateString, days) => {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); 
    date.setDate(date.getDate() + days);

    const newYear = date.getFullYear();
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newDay = String(date.getDate()).padStart(2, '0');

    return `${newYear}-${newMonth}-${newDay}`;
};

// 시작일과 종료일 사이 총 일수 계산하는 함수
const calculateDayCount = (start, end) => {
    if (!start || !end) return 1;
    
    const dateStart = new Date(start);
    const dateStartLocal = new Date(dateStart.getUTCFullYear(), dateStart.getUTCMonth(), dateStart.getUTCDate());

    const dateEnd = new Date(end);
    const dateEndLocal = new Date(dateEnd.getUTCFullYear(), dateEnd.getUTCMonth(), dateEnd.getUTCDate());

    if (dateEndLocal.getTime() < dateStartLocal.getTime()) return 1; 
    
    const timeDiff = dateEndLocal.getTime() - dateStartLocal.getTime();
    const dayCount = Math.floor(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return dayCount > 0 ? dayCount : 1;
};

// --- 스타일 컴포넌트 ---
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
const BackButton = styled.span`
    /* 기존 스타일 유지 */
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text};
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

// PlaceItem 스타일 변경: 클릭/선택 효과 추가
const PlaceItem = styled.div<{ $isSelected?: boolean }>`
    display: flex;
    align-items: center;
    padding: 12px;
    background-color: ${({ theme, $isSelected }) => 
        $isSelected ? '#e3f2fd' : theme.colors.inputBackground};
    border-radius: 12px;
    margin-bottom: 10px;
    gap: 10px;
    cursor: pointer; /* 클릭 가능하도록 변경 */
    transition: all 0.2s ease;
    border: 2px solid ${({ theme, $isSelected }) => 
        $isSelected ? theme.colors.primary : 'transparent'};
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
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 서울 시청 기본값
    const [mapZoom, setMapZoom] = useState(12); // 줌 레벨 상태 추가
    const [selectedPlace, setSelectedPlace] = useState<{ day: number; order: number } | null>(null); // 선택된 장소 상태 추가

    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    // 날짜 기간에 맞춰 schedules를 초기화하는 함수
    const initializeSchedulesByDates = (newStart, newEnd) => {
        const count = calculateDayCount(newStart, newEnd);
        
        const newSchedules = [];
        for (let i = 1; i <= count; i++) {
            // 기존 일정 유지는 선택 사항
            newSchedules.push({ 
                day: i, 
                places: schedules.find(s => s.day === i)?.places || [] 
            }); 
        }
        setSchedules(newSchedules.length > 0 ? newSchedules : [{ day: 1, places: [] }]);
        setCurrentDay(1); 
    };

    const getCurrentDayColor = (day: number) => {
        if (day <= DAY_COLORS.length) {
            return DAY_COLORS[day - 1];
        }
        const hue = (day * 137.508) % 360;
        return `hsl(${hue}, 65%, 50%)`;
    };

    const currentColor = getCurrentDayColor(currentDay);

    // 현재 일차 경로 좌표
    const pathCoordinates =
        schedules[currentDay - 1]?.places.map((place) => ({
            lat: place.latitude,
            lng: place.longitude,
        })) || [];

    const lineSymbol = {
        path: "M 0,-1 0,1",
        strokeOpacity: 1,
        scale: 3,
        strokeColor: currentColor,
    };

    const getCategoryFromTypes = (types: string[] | undefined): string => {
        if (!types) return "기타";
        if (types.includes("lodging")) return "숙소";
        if (types.includes("restaurant") || types.includes("food") || types.includes("cafe")) return "맛집/카페";
        if (types.includes("tourist_attraction") || types.includes("museum") || types.includes("park")) return "명소";
        if (types.includes("transit_station") || types.includes("airport")) return "교통";
        if (types.includes("shopping_mall") || types.includes("store")) return "쇼핑";
        return "기타";
    };

    const onPlaceSelected = () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place) return;
        if (!place.geometry || !place.geometry.location || !place.place_id) {
            alert(
                `"${place.name}"에 대한 세부 정보를 찾을 수 없습니다.\n자동완성 목록에서 장소를 클릭하세요.`
            );
            return;
        }
        
        const currentPlacesCount = schedules[currentDay - 1].places.length;

        const newPlace: PlannerPlace = {
            placeName: place.name || "알 수 없는 장소",
            googlePlaceId: place.place_id,
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            order: currentPlacesCount + 1,
            category: getCategoryFromTypes(place.types),
            memo: "",
        };

        // 지도 중앙 이동 및 선택 표시
        setMapCenter({ lat: newPlace.latitude, lng: newPlace.longitude });
        setMapZoom(12);
        setSelectedPlace({ day: currentDay, order: newPlace.order });

        const newSchedules = [...schedules];
        newSchedules[currentDay - 1].places.push(newPlace);
        setSchedules(newSchedules);
    };

    const removePlace = (dayIdx: number, placeIdx: number) => {
        const newSchedules = [...schedules];
        const removedOrder = newSchedules[dayIdx].places[placeIdx].order; // 삭제될 장소의 순서

        newSchedules[dayIdx].places.splice(placeIdx, 1);
        newSchedules[dayIdx].places.forEach((p, idx) => {
            p.order = idx + 1;
        });
        setSchedules(newSchedules);
        
        // 삭제된 장소가 선택된 장소였다면 선택 해제
        if (selectedPlace?.day === newSchedules[dayIdx].day && selectedPlace?.order === removedOrder) {
            setSelectedPlace(null);
        }
    };

    // 일차 추가 핸들러
    const addDay = () => {
        const nextDay = schedules.length + 1;

        setSchedules([...schedules, { day: nextDay, places: [] }]);
        setCurrentDay(nextDay);
        setSelectedPlace(null);

        // 일차 늘어나면 endDate도 늘어남
        if (endDate) { 
            const newEndDate = addDaysToDateString(endDate, 1);
            setEndDate(newEndDate);
        } else if (startDate) {
            const daysToAdd = nextDay - calculateDayCount(startDate, startDate); 
            const newEndDate = addDaysToDateString(startDate, daysToAdd); 
            setEndDate(newEndDate);
        }
    };

    // 해당 일차 삭제 및 초기화 (1일차만 남았을 때 포함)
    const handleDeleteDay = () => {
        // 1일차만 남았을 경우 내용 비움 
        if (schedules.length === 1) {
            if (window.confirm("1일차 일정을 모두 비우시겠습니까?")) {
                setSchedules([{ day: 1, places: [] }]);
                if (startDate) {
                    setEndDate(startDate); 
                } else {
                    setEndDate('');
                }
                setSelectedPlace(null);
            }
            return;
        }

        // 2일 이상의 경우: 해당 일차 삭제
        if (!window.confirm(`${currentDay}일차 일정을 모두 삭제하시겠습니까?`)) {
            return;
        }

        const newSchedules = [...schedules];
        newSchedules.splice(currentDay - 1, 1);

        // 날짜 번호 재정렬 (1, 2, 3...)
        newSchedules.forEach((schedule, index) => {
            schedule.day = index + 1;
        });

        setSchedules(newSchedules);

        // 일차가 줄어들면 endDate도 줄어듬
        if (endDate) {
            const newEndDate = addDaysToDateString(endDate, -1);
            setEndDate(newEndDate); 
        }

        // 삭제된 날짜가 마지막 날짜였다면 그 앞 날짜로 이동
        const nextCurrentDay = Math.min(currentDay, newSchedules.length);
        setCurrentDay(nextCurrentDay);
        setSelectedPlace(null);

        // 지도 중심을 다음 일차의 첫 번째 장소로 이동 (없으면 기본값)
        const nextPlaces = newSchedules.find(s => s.day === nextCurrentDay)?.places;
        if (nextPlaces && nextPlaces.length > 0) {
            setMapCenter({ lat: nextPlaces[0].latitude, lng: nextPlaces[0].longitude });
        } else {
            setMapCenter({ lat: 37.5665, lng: 126.978 });
        }
    };
    
    // 장소 클릭 시 지도 이동 및 선택 표시 핸들러
    const handlePlaceClick = (place: PlannerPlace, day: number) => {
        setMapCenter({ lat: place.latitude, lng: place.longitude });
        setMapZoom(15); // 선택 시 확대
        setSelectedPlace({ day, order: place.order });
    };

    const handleSave = async () => {
        if (!title.trim()) return alert("여행 제목을 입력하세요.");
        if (!startDate || !endDate) return alert("여행 기간을 선택해주세요.");
        
        const scheduleDays = schedules.length;
        const calculatedDays = calculateDayCount(startDate, endDate);
        
        if (scheduleDays !== calculatedDays) {
            if (!window.confirm(`일정 개수(${scheduleDays}일차)와 선택된 기간(${calculatedDays}일)이 다릅니다. 이대로 저장하시겠습니까?`)) {
                return;
            }
        }

        const flattenedDetails: PlannerDetailRequestDTO[] = schedules.flatMap((schedule) => 
            schedule.places.map((place) => ({
                plannerOrder: place.order, 
                day: schedule.day, 
                googlePlaceId: place.googlePlaceId, 
            }))
        );

        const requestData: PlannerCreateRequest = {
            title,
            startDate,
            endDate,
            memberCount: 1,
            schedules: flattenedDetails, 
        };

        try {
            const result = await savePlanner(requestData as any); 
            alert("플래너가 저장되었습니다");
            const newPlannerId = result.plannerId;
            navigate(`/planner/${newPlannerId}`, { replace: true }); 
        } catch (error) {
            console.error(error);
            alert("저장 중 오류가 발생했습니다.");
        }
    };

    if (!isLoaded) return <div>지도를 불러오는 중...</div>;

    return (
        <Container>
            <TopBar>
                <BackButton onClick={() => navigate(-1)}>
                    취소
                </BackButton>
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
                        onChange={(e) => {
                            const newStart = e.target.value; 
                            setStartDate(newStart);
                            initializeSchedulesByDates(newStart, endDate); 
                        }}
                    />
                    <span style={{ alignSelf: "center", color: "#888" }}>~</span>
                    <DateInput
                        type="date"
                        value={endDate}
                        onChange={(e) => {
                            const newEnd = e.target.value;
                            setEndDate(newEnd);
                            initializeSchedulesByDates(startDate, newEnd); 
                        }}
                    />
                </DateRow>
            </InputGroup>

            <MapContainer>
                <SearchBoxWrapper>
                    <Autocomplete
                        onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
                        onPlaceChanged={onPlaceSelected}
                        options={{ fields: ["name", "geometry", "types", "place_id"], language: "ko" }}
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
                    zoom={mapZoom} // Zoom 상태 사용
                    options={{ disableDefaultUI: true, clickableIcons: false }}
                >
                    {/* 현재 일차 경로 */}
                    {pathCoordinates.length > 1 && (
                        <Polyline
                            path={pathCoordinates}
                            options={{
                                strokeOpacity: 0,
                                icons: [{ icon: lineSymbol, offset: "0", repeat: "20px" }],
                                zIndex: 1,
                            }}
                        />
                    )}

                    {/* 현재 일차 마커 */}
                    {schedules[currentDay - 1]?.places.map((place, idx) => {
                        const isSelected = selectedPlace?.day === currentDay && selectedPlace?.order === place.order;
                        return (
                            <Marker
                                key={`${currentDay}-${idx}`}
                                position={{ lat: place.latitude, lng: place.longitude }}
                                label={{
                                    text: String(idx + 1),
                                    color: "white",
                                    fontWeight: "bold",
                                }}
                                zIndex={isSelected ? 3 : 2}
                                icon={{
                                    path: "M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z",
                                    fillColor: currentColor,
                                    fillOpacity: 1,
                                    strokeColor: isSelected ? 'black' : 'white', // 선택 시 검은색 테두리
                                    strokeWeight: isSelected ? 3 : 2,
                                    scale: isSelected ? 1.8 : 1.5, // 선택 시 확대
                                    labelOrigin: new google.maps.Point(12, 9),
                                    anchor: new google.maps.Point(12, 22),
                                }}
                            />
                        );
                    })}
                </GoogleMap>
            </MapContainer>

            <ScheduleContainer>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "12px",
                    }}
                >
                    <DaySelector style={{ marginBottom: 0, flex: 1 }}>
                        {schedules.map((s) => (
                            <DayButton
                                key={s.day}
                                $active={currentDay === s.day}
                                $color={getCurrentDayColor(s.day)}
                                onClick={() => {
                                    setCurrentDay(s.day);
                                    setSelectedPlace(null); // 일차 변경 시 선택 해제
                                }}
                            >
                                {s.day}일차
                            </DayButton>
                        ))}
                        <DayButton $active={false} $color="gray" onClick={addDay}>
                            + 추가
                        </DayButton>
                    </DaySelector>

                    <button
                        onClick={handleDeleteDay}
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "0 10px",
                            color: "#999",
                            display: "flex",
                            alignItems: "center",
                        }}
                        title={schedules.length === 1 ? "일정 비우기" : "현재 일차 삭제"}
                    >
                        <IoTrashOutline size={20} />
                    </button>
                </div>

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
                            <PlaceItem
                                key={idx}
                                onClick={() => handlePlaceClick(place, currentDay)}
                                $isSelected={selectedPlace?.day === currentDay && selectedPlace?.order === place.order}
                            >
                                <NumberBadge $color={currentColor}>{idx + 1}</NumberBadge>
                                <PlaceInfo>
                                    <PlaceName>{place.placeName}</PlaceName>
                                    <PlaceCategory>{place.category || "기타"}</PlaceCategory>
                                </PlaceInfo>
                                <DeleteButton onClick={(e) => {
                                    e.stopPropagation(); 
                                    removePlace(currentDay - 1, idx);
                                }}>
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