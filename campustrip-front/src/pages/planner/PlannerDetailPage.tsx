import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import {
    GoogleMap,
    useJsApiLoader,
    Marker,
    Polyline,
} from "@react-google-maps/api";
import { IoArrowBack, IoCreateOutline, IoTrashOutline } from "react-icons/io5";

import type { 
    PlannerDetailResponse, 
    PlannerDetailDTO, 
    PlannerSchedule, 
    PlannerPlace 
} from "../../types/planner"; 
import { getPlannerDetail, deletePlanner } from "../../api/planners"; 


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

const libraries: "places"[] = ["places"];

// --- 스타일 컴포넌트 ---
const PageContainer = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background};
`;

const TopBar = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 20;
    padding: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(to bottom, rgba(0,0,0,0.3), transparent);
`;

const BackButton = styled.button`
    background: rgba(255, 255, 255, 0.44);
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);


    & > svg {
        color: #333 !important; 
        font-size: 24px !important; 
        min-width: 24px;
        min-height: 24px;
    }
`;

const MapSection = styled.div<{ $height: number }>`
    width: 100%;
    height: ${({ $height }) => 100 - $height}%;
    flex-shrink: 0;
    position: relative;
    transition: ${({ theme }) => theme && !theme ? 'height 0.1s ease-out' : 'none'};
`;

const ContentContainer = styled.div<{ $height: number; $isDragging: boolean }>`
    height: ${({ $height }) => $height}%;
    background-color: ${({ theme }) => theme.colors.background};
    border-top-left-radius: 24px;
    border-top-right-radius: 24px;
    margin-top: -24px;
    z-index: 10;
    box-shadow: 0 -4px 16px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    transition: ${({ $isDragging }) => $isDragging ? 'none' : 'height 0.1s ease-out'};
    overflow: hidden;
`;

const HandleBar = styled.div`
    width: 40px;
    height: 4px;
    background-color: ${({ theme }) => theme.colors.borderColor};
    margin: 16px auto 12px;
    border-radius: 2px;
    cursor: grab;
    touch-action: none;
    flex-shrink: 0;
    
    &:active {
        cursor: grabbing;
    }
`;

const ScrollableContent = styled.div`
    flex: 1;
    overflow-y: auto;
    padding: 0 20px 24px 20px;
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

const PlaceItem = styled.div<{ $isSelected?: boolean }>`
    display: flex;
    align-items: flex-start;
    padding: 12px;
    background-color: ${({ theme, $isSelected }) => 
        $isSelected ? '#e3f2fd' : theme.colors.inputBackground};
    border-radius: 12px;
    margin-bottom: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    border: 2px solid ${({ theme, $isSelected }) => 
        $isSelected ? theme.colors.primary : 'transparent'};

    &:hover {
        background-color: #e3f2fd;
        transform: translateX(4px);
    }
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
    const { plannerId } = useParams();
    const id = plannerId;
    const navigate = useNavigate();

    // 1. 백엔드에서 받은 기본 플래너 정보 (ID만 포함)
    const [planner, setPlanner] = useState<PlannerDetailResponse | null>(null); 
    // 2. Google Places API를 통해 상세 정보가 채워진 렌더링용 스케줄
    const [schedulePlaces, setSchedulePlaces] = useState<PlannerSchedule[]>([]);
    // 3. 지도 중심 좌표 관리
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
    const [mapZoom, setMapZoom] = useState(12);
    const [selectedPlace, setSelectedPlace] = useState<{ day: number; order: number } | null>(null);

    // 4. 드래그 관련 state
    const [containerHeight, setContainerHeight] = useState(55); // 퍼센트 단위
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startHeight, setStartHeight] = useState(55);

    const { isLoaded } = useJsApiLoader({
        id: "google-map-script",
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
        libraries: libraries,
        language: "ko",
    });

    // 카테고리 분류 함수 
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
                    "restaurant", "food", "cafe", "bakery", "bar", "meal_takeaway",
                ].includes(t)
            )
        )
            return "맛집/카페";
        if (
            types.some((t) =>
                [
                    "shopping_mall", "department_store", "clothing_store", "convenience_store", "store",
                ].includes(t)
            )
        )
            return "쇼핑";
        if (
            types.some((t) =>
                [
                    "tourist_attraction", "amusement_park", "park", "museum", "art_gallery", "landmark", "point_of_interest",
                ].includes(t)
            )
        )
            return "명소";
        if (
            types.some((t) =>
                [
                    "airport", "bus_station", "subway_station", "train_station", "transit_station",
                ].includes(t)
            )
        )
            return "교통";
        return "기타";
    };

    //  Google Place ID를 이용해 장소 상세 정보를 가져와 schedulePlaces 상태를 업데이트하는 로직
    useEffect(() => {
        if (!id || !isLoaded) return;
        
        const fetchDetails = async (plannerId: number) => {
            try {
                // 1. 백엔드 API 호출 (PlannerDetailDTO 리스트 포함)
                const plannerData: PlannerDetailResponse = await getPlannerDetail(plannerId);
                setPlanner(plannerData);
                
                const detailList = plannerData.details; 
                
                console.log("[Detail Load] 백엔드 응답 (ID만 포함):", detailList); 

                if (!detailList || detailList.length === 0) {
                    setSchedulePlaces([]);
                    return;
                }

                // PlaceService 인스턴스 생성
                const service = new google.maps.places.PlacesService(
                    document.createElement("div")
                );

                // 2. Google Place ID를 이용해 상세 정보를 비동기적으로 가져옴
                const placeDetailPromises = detailList.map(
                    (scheduleItem: PlannerDetailDTO) =>
                        new Promise<({ day: number } & PlannerPlace) | null>((resolve) => {
                            service.getDetails(
                                { placeId: scheduleItem.googlePlaceId, fields: ['name', 'geometry', 'types'] },
                                (place, status) => {
                                    if (
                                        status === google.maps.places.PlacesServiceStatus.OK &&
                                        place?.geometry?.location
                                    ) {
                                        const placeInfo: PlannerPlace = {
                                            googlePlaceId: scheduleItem.googlePlaceId, // ID 저장
                                            placeName: place.name || "알 수 없는 장소",
                                            latitude: place.geometry.location.lat(),
                                            longitude: place.geometry.location.lng(),
                                            order: scheduleItem.plannerOrder,
                                            category: getCategoryFromTypes(place.types),
                                            memo: "", 
                                        };
                                        resolve({ ...placeInfo, day: scheduleItem.day });
                                    } else {
                                        // Google API 오류 상태 파악 
                                        console.error(`[Error] Place ID: ${scheduleItem.googlePlaceId}, Status: ${status}`);
                                        resolve(null);
                                    }
                                }
                            );
                        })
                );

                const resolvedPlaces = await Promise.all(placeDetailPromises);

                // 3. 일차별로 그룹화하고 정렬하여 맵/리스트 렌더링용 데이터 생성
                const finalSchedules = resolvedPlaces
                    .filter((p): p is ({ day: number } & PlannerPlace) => p !== null)
                    .reduce((acc, current) => {
                        const day = current.day;
                        let schedule = acc.find(s => s.day === day);
                        if (!schedule) {
                            schedule = { day, places: [] };
                            acc.push(schedule);
                        }
                        schedule.places.push(current);
                        return acc;
                    }, [] as PlannerSchedule[])
                    .sort((a, b) => a.day - b.day);
                
                finalSchedules.forEach(schedule => {
                    schedule.places.sort((a, b) => a.order - b.order);
                });
                
                setSchedulePlaces(finalSchedules);

            } catch (err) {
                console.error("[Error] 플래너 정보 로드 중 치명적인 오류 발생:", err);
                alert("플래너 정보를 불러오지 못했습니다.");
                navigate("/planner");
            }
        };

        fetchDetails(Number(id));
    }, [id, navigate, isLoaded]); 

    // 지도 경로 좌표 계산 
    const pathCoordinates = useMemo(() => {
        if (!schedulePlaces) return [];
        return schedulePlaces.flatMap((schedule) =>
            schedule.places.map((p) => ({ lat: p.latitude, lng: p.longitude }))
        );
    }, [schedulePlaces]);

    const handleDelete = async () => {
        if (window.confirm("정말 이 플래너를 삭제하시겠습니까?")) {
            try {
                await deletePlanner(Number(id));
                alert("삭제되었습니다.");
                navigate("/planner");
            } catch {
                alert("삭제 중 오류가 발생했습니다.");
            }
        }
    };

    const handleEdit = () => {
        if (!isLoaded) {
        alert("지도가 아직 로딩 중입니다. 잠시 후 다시 시도해주세요.");
        return;
    }
        navigate(`/planner/edit/${id}`);
    };

    const getDayColor = (day: number) => {
        return DAY_COLORS[(day - 1) % DAY_COLORS.length];
    };

    // PlaceItem 클릭 시 지도 중심 이동
    const handlePlaceClick = (place: PlannerPlace, day: number) => {
        setMapCenter({ lat: place.latitude, lng: place.longitude });
        setMapZoom(15); // 확대
        setSelectedPlace({ day, order: place.order });
    };

    // HandleBar 드래그 시작
    const handleDragStart = (e: React.MouseEvent | React.TouchEvent) => {
        setIsDragging(true);
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        setStartY(clientY);
        setStartHeight(containerHeight);
    };

    // 드래그 중
    useEffect(() => {
        if (!isDragging) return;

        const handleDragMove = (e: MouseEvent | TouchEvent) => {
            const clientY = 'touches' in e ? (e as TouchEvent).touches[0].clientY : (e as MouseEvent).clientY;
            const deltaY = startY - clientY;
            const viewportHeight = window.innerHeight;
            const deltaPercent = (deltaY / viewportHeight) * 100;

            let newHeight = startHeight + deltaPercent;
            // 최소 20%, 최대 80%로 제한
            newHeight = Math.max(20, Math.min(80, newHeight));

            setContainerHeight(newHeight);
        };

        const handleDragEnd = () => {
            setIsDragging(false);
        };

        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('touchmove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchend', handleDragEnd);

        return () => {
            document.removeEventListener('mousemove', handleDragMove);
            document.removeEventListener('touchmove', handleDragMove);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchend', handleDragEnd);
        };
    }, [isDragging, startY, startHeight]);

    // Intersection Observer를 사용하여 스크롤 시 지도 중심 이동
    const placeItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const setPlaceItemRef = useCallback((key: string, element: HTMLDivElement | null) => {
        if (element) {
            placeItemRefs.current.set(key, element);
        } else {
            placeItemRefs.current.delete(key);
        }
    }, []);

    useEffect(() => {
        if (!schedulePlaces || schedulePlaces.length === 0) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        const [dayStr, orderStr] = entry.target.getAttribute('data-place')?.split('-') || [];
                        const day = parseInt(dayStr);
                        const order = parseInt(orderStr);

                        const schedule = schedulePlaces.find(s => s.day === day);
                        const place = schedule?.places.find(p => p.order === order);

                        if (place) {
                            setMapCenter({ lat: place.latitude, lng: place.longitude });
                            setMapZoom(14);
                            setSelectedPlace({ day, order });
                        }
                    }
                });
            },
            {
                root: null,
                rootMargin: '-40% 0px -40% 0px', // 화면 중앙 근처에서 트리거
                threshold: [0.5, 0.75, 1],
            }
        );

        placeItemRefs.current.forEach((element) => {
            observer.observe(element);
        });

        return () => {
            observer.disconnect();
        };
    }, [schedulePlaces]);

    // 로딩 조건 추가: planner가 null이면 렌더링을 막음
    if (!isLoaded || !planner) return <div>Loading...</div>; 
    

    return (
        <PageContainer>
            {/* 뒤로가기 버튼 영역 */}
            <TopBar>
                <BackButton onClick={() => navigate("/planner")}>
                    <IoArrowBack style={{ color: "#333", fontSize: "32px" }} />
                </BackButton>
            </TopBar>

            <MapSection $height={containerHeight}>
                <GoogleMap
                    mapContainerStyle={{ width: "100%", height: "100%" }}
                    center={mapCenter || pathCoordinates[0] || { lat: 37.5665, lng: 126.9780 }}
                    zoom={mapZoom}
                    options={{ disableDefaultUI: true, clickableIcons: false }}
                >
                    {/* schedulePlaces 기반으로 지도 경로(Polyline) 렌더링 */}
                    {schedulePlaces?.map((schedule) => {
                        const dayColor = getDayColor(schedule.day);
                        const path = (schedule.places || []).map((p) => ({
                             lat: p.latitude,
                             lng: p.longitude,
                        }));

                        // 장소가 2개 이상일 때만 경로 표시
                        if (path.length < 2) return null;
                        
                        return (
                            <Polyline
                                key={`polyline-${schedule.day}`}
                                path={path}
                                options={{
                                    strokeOpacity: 0, // 실선 투명하게
                                    icons: [ // 점선 모양 아이콘 설정
                                        {
                                            icon: { 
                                                path: "M 0,-1 0,1", 
                                                strokeOpacity: 1, 
                                                scale: 3, 
                                                strokeColor: dayColor, // 일차별 색상 적용
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

                    {/* schedulePlaces 기반으로 지도 마커 렌더링 */}
                    {schedulePlaces?.map((schedule) =>
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

            <ContentContainer $height={containerHeight} $isDragging={isDragging}>
                <HandleBar
                    onMouseDown={handleDragStart}
                    onTouchStart={handleDragStart}
                />
                <ScrollableContent>
                    <Header>
                        <TitleRow>
                            {/* planner가 null이 아니므로 안전하게 접근 가능 */}
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

                    {/* schedulePlaces 데이터 기반으로 일정 리스트 렌더링 */}
                    {(!schedulePlaces || schedulePlaces.length === 0) ? (
                        <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                            <p>등록된 상세 일정이 없습니다.</p>
                        </div>
                    ) : (
                        schedulePlaces.map((schedule) => {
                            const dayColor = getDayColor(schedule.day);
                            return (
                                <DaySection key={schedule.day}>
                                    <DayTitle $color={dayColor}>{schedule.day}일차</DayTitle>
                                    {(!schedule.places || schedule.places.length === 0) ? (
                                        <p style={{ color: "#999", fontSize: "14px", padding: "8px" }}>일정이 없습니다.</p>
                                    ) : (
                                        schedule.places.map((place) => (
                                            <PlaceItem
                                                key={place.order}
                                                ref={(el) => setPlaceItemRef(`${schedule.day}-${place.order}`, el)}
                                                data-place={`${schedule.day}-${place.order}`}
                                                onClick={() => handlePlaceClick(place, schedule.day)}
                                                $isSelected={selectedPlace?.day === schedule.day && selectedPlace?.order === place.order}
                                            >
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
                </ScrollableContent>
            </ContentContainer>
        </PageContainer>
    );
}

export default PlannerDetailPage;