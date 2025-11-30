import React, { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
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
    PlannerDetailResponse, // 백엔드 응답 DTO
    PlannerDetailDTO, // 백엔드 상세 DTO
} from "../../types/planner"; 
// 수정 API와 상세 정보 로드 API를 모두 사용
import { updatePlanner, getPlannerDetail } from "../../api/planners"; 

// 1~8일차 고정 색상 
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

    &::-webkit-scrollbar {
        display: none;
    }
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
    transition: all 0.2s;

    outline: none;
    box-shadow: ${({ $active, $color }) =>
        $active ? `0 4px 10px ${$color}66` : "0 2px 4px rgba(0,0,0,0.05)"};

    &:active {
        transform: scale(0.95);
    }
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

function PlannerEditPage() { 
    const { plannerId } = useParams(); // ID 가져오기
    const id = plannerId;
    const navigate = useNavigate();

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries,
    });

    const [title, setTitle] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // 전체 일정 데이터 (장소 상세 정보 포함)
    const [schedules, setSchedules] = useState<PlannerSchedule[]>([]); 

    const [currentDay, setCurrentDay] = useState(1);
    const [mapCenter, setMapCenter] = useState({ lat: 37.5665, lng: 126.978 }); // 서울 시청
    const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

    useEffect(() => {
        if (!id || !isLoaded) return;

        const fetchExistingDetails = async (plannerId: number) => {
            try {
                // 1. 백엔드에서 기본 정보와 PlannerDetailDTO (ID만 포함)를 가져옴
                const plannerData: PlannerDetailResponse = await getPlannerDetail(plannerId);
                setTitle(plannerData.title);
                setStartDate(plannerData.startDate);
                setEndDate(plannerData.endDate);

                if (!plannerData.schedules || plannerData.schedules.length === 0) {
                    setSchedules([{ day: 1, places: [] }]);
                    return;
                }

                const service = new google.maps.places.PlacesService(document.createElement("div"));

                // 2. Google Place ID를 이용해 상세 정보를 비동기적으로 가져옴
                const placeDetailPromises = plannerData.schedules.map(
                    (scheduleItem: PlannerDetailDTO) =>
                        new Promise<({ day: number } & PlannerPlace) | null>((resolve) => {
                            service.getDetails(
                                { placeId: scheduleItem.googlePlaceId, fields: ['name', 'geometry', 'types'] },
                                (place, status) => {
                                    if (status === google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
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
                                        console.error(`[Error] Edit Load Place ID: ${scheduleItem.googlePlaceId}, Status: ${status}`);
                                        resolve(null);
                                    }
                                }
                            );
                        })
                );

                const resolvedPlaces = await Promise.all(placeDetailPromises);

                // 3. 일차별로 그룹화하고 정렬하여 상태 설정
                const groupedPlaces = resolvedPlaces
                    .filter((p): p is ({ day: number } & PlannerPlace) => p !== null)
                    .reduce((acc, current) => {
                        const day = current.day;
                        if (!acc[day]) {
                            acc[day] = { day, places: [] };
                        }
                        acc[day].places.push(current);
                        return acc;
                    }, {} as { [key: number]: PlannerSchedule });

                const finalSchedules = Object.values(groupedPlaces).sort((a, b) => a.day - b.day);
                finalSchedules.forEach(schedule => {
                    schedule.places.sort((a, b) => a.order - b.order);
                });
                
                setSchedules(finalSchedules.length > 0 ? finalSchedules : [{ day: 1, places: [] }]);
                if (finalSchedules.length > 0) {
                    setCurrentDay(finalSchedules[0].day);
                    setMapCenter({ lat: finalSchedules[0].places[0].latitude, lng: finalSchedules[0].places[0].longitude });
                }

            } catch (err) {
                console.error("플래너 로드 실패:", err);
                alert("플래너 정보를 불러오지 못했습니다.");
                navigate("/planner");
            }
        };

        fetchExistingDetails(Number(id));
    }, [id, navigate, isLoaded]);


    // 현재 일차 색상 계산 함수
    const getCurrentDayColor = (day: number) => {
        if (day <= DAY_COLORS.length) {
            return DAY_COLORS[day - 1];
        }
        const hue = (day * 137.508) % 360;
        return `hsl(${hue}, 65%, 50%)`;
    };
    const currentColor = getCurrentDayColor(currentDay);

    // 현재 일차의 장소 목록 (리스트 표시용)
    const currentPlaces = useMemo(() => schedules.find(s => s.day === currentDay)?.places || [], [schedules, currentDay]);


    // 카테고리 분류 함수 
    const getCategoryFromTypes = (types: string[] | undefined): string => {
        if (!types || types.length === 0) return "기타";
        if (
            types.some((t) =>
                ["lodging", "campground", "hotel", "motel", "guest_house"].includes(t)
            )
        ) return "숙소";
        
        if (
            types.some((t) =>
                [
                    "restaurant", "food", "cafe", "bakery", "bar", "meal_takeaway",
                ].includes(t)
            )
        ) return "맛집/카페";
        if (
            types.some((t) =>
                [
                    "shopping_mall", "department_store", "clothing_store", "convenience_store", "store",
                ].includes(t)
            )
        ) return "쇼핑";
        if (
            types.some((t) =>
                [
                    "tourist_attraction", "amusement_park", "park", "museum", "art_gallery", "landmark", "point_of_interest",
                ].includes(t)
            )
        ) return "명소";
        if (
            types.some((t) =>
                [
                    "airport", "bus_station", "subway_station", "train_station", "transit_station",
                ].includes(t)
            )
        ) return "교통";
        return "기타";
    };

    // 장소 추가 핸들러 
    const onPlaceSelected = () => {
        const place = autocompleteRef.current?.getPlace();
        if (!place || !place.place_id || !place.geometry?.location) {
            alert(`"${place?.name || "선택된 장소"}"의 상세 정보를 찾을 수 없습니다.`);
            return;
        }

        const newPlace: PlannerPlace = {
            googlePlaceId: place.place_id, 
            placeName: place.name || "알 수 없는 장소",
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
            order: currentPlaces.length + 1,
            category: getCategoryFromTypes(place.types),
            memo: "",
        };

        setMapCenter({ lat: newPlace.latitude, lng: newPlace.longitude });

        setSchedules((prevSchedules) =>
            prevSchedules.map((schedule) =>
                schedule.day === currentDay
                    ? { ...schedule, places: [...schedule.places, newPlace] }
                    : schedule
            )
        );
    };

    // 장소 삭제 핸들러 (
    const removePlace = (placeIdx: number) => { 
        setSchedules((prevSchedules) => {
            const updatedSchedules = prevSchedules.map((schedule) => {
                if (schedule.day !== currentDay) return schedule;
                
                const newPlaces = [...schedule.places];
                newPlaces.splice(placeIdx, 1);
                
                // 순서 재정렬
                newPlaces.forEach((p, i) => {
                    p.order = i + 1;
                });
                return { ...schedule, places: newPlaces };
            });
            return updatedSchedules;
        });
    };
    
    // 일차 추가 
    const addDay = () => {
        const nextDay = schedules.length > 0 ? schedules[schedules.length - 1].day + 1 : 1;
        setSchedules([...schedules, { day: nextDay, places: [] }]);
        setCurrentDay(nextDay);
    };

    // updatePlanner 사용
    const handleSave = async () => {
        if (!title.trim()) return alert("여행 제목을 입력하세요.");
        if (!id) return alert("플래너 ID를 찾을 수 없습니다.");

        // 백엔드 DTO 형식에 맞춰 데이터 가공: { day, plannerOrder, googlePlaceId }
        const plannerDetails = schedules.flatMap(schedule => 
            schedule.places.map(place => ({
                day: schedule.day, 
                plannerOrder: place.order, 
                googlePlaceId: place.googlePlaceId, // ID만 전송
            }))
        );

        const updatedPlannerData = {
            title,
            startDate,
            endDate,
            schedules: plannerDetails, 
            membershipId: 1, // 임시로 사용자 ID를 1로 설정
        };

        try {
            await updatePlanner(Number(id), updatedPlannerData); // updatePlanner API 사용
            alert("플래너가 수정되었습니다");
            navigate(`/planner/${id}`); // 수정 후 상세 페이지로 이동
        } catch (error) {
            console.error(error);
            alert("수정 중 오류가 발생했습니다.");
        }
    };

    // 일차 변경 시 지도 이동 
    useEffect(() => {
        if (currentPlaces.length > 0) {
            setMapCenter({
                lat: currentPlaces[0].latitude,
                lng: currentPlaces[0].longitude,
            });
        }
    }, [currentDay, currentPlaces]);

    // 로딩 처리: Google Map 로딩, ID 존재 및 기본 정보 로딩 대기
    if (!isLoaded || !id || title === "") return <div>Loading...</div>;

    return (
        <Container>
            <TopBar>
                <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
                    취소
                </span>
                <h3>플래너 수정</h3>
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
                    {/* 마커 및 Polyline 렌더링 (PlannerCreatePage와 동일) */}
                    {schedules.map((schedule) => {
                        const dayColor = getCurrentDayColor(schedule.day);
                        const path = schedule.places.map((p) => ({
                            lat: p.latitude,
                            lng: p.longitude,
                        }));

                        return (
                            <React.Fragment key={schedule.day}>
                                {/* 구간별 Polyline */}
                                {path.map((point, index) => {
                                    if (index === path.length - 1) return null;

                                    const segmentPath = [path[index], path[index + 1]];

                                    return (
                                        <Polyline
                                            key={`seg-${schedule.day}-${index}`}
                                            path={segmentPath}
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

                                {/* 마커 */}
                                {schedule.places.map((place, idx) => (
                                    <Marker
                                        key={`marker-${schedule.day}-${idx}-${place.placeName}`}
                                        position={{ lat: place.latitude, lng: place.longitude }}
                                        label={{
                                            text: String(idx + 1),
                                            color: "white",
                                            fontWeight: "bold",
                                        }}
                                        zIndex={2}
                                        icon={{
                                            path: "M 12 2 C 8.13 2 5 5.13 5 9 c 0 5.25 7 13 7 13 s 7 -7.75 7 -13 c 0 -3.87 -3.13 -7 -7 -7 z",
                                            fillColor: dayColor,
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
                    <DayButton $active={false} $color="gray" onClick={addDay}>
                        + 추가
                    </DayButton>
                </DaySelector>

                <div style={{ paddingBottom: "20px" }}>
                    {currentPlaces.length === 0 ? (
                        <p
                            style={{ textAlign: "center", color: "#999", marginTop: "20px" }}
                        >
                            검색창을 이용해
                            <br />
                            일정을 추가하세요
                        </p>
                    ) : (
                        currentPlaces.map((place, idx) => (
                            <PlaceItem key={idx}>
                                <NumberBadge $color={currentColor}>{idx + 1}</NumberBadge>
                                <PlaceInfo>
                                    <PlaceName>{place.placeName}</PlaceName>
                                    <PlaceCategory>{place.category || "기타"}</PlaceCategory>
                                </PlaceInfo>
                                <DeleteButton onClick={() => removePlace(idx)}> 
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

export default PlannerEditPage;