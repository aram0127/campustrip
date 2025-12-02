import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useContext,
} from "react";
import styled from "styled-components";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import { useNavigate, useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";
import { AuthContext } from "../../context/AuthContext";
import { type LocationMessage, type Companion } from "../../types/companion";
import { getToken } from "../../utils/token";

const ControlsWrapper = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MapWrapper = styled.div`
  height: 400px;
  width: 100%;
  margin-bottom: 1rem;
`;

const StatusText = styled.p`
  padding: 2rem;
  text-align: center;
`;

const ErrorText = styled(StatusText)`
  color: ${({ theme }) => theme.colors.error};
`;

const CompanionListWrapper = styled.div`
  h3 {
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
  }
`;

const CompanionItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: ${({ theme }) => theme.colors.background};
  border-radius: 8px;
  margin-bottom: 0.5rem;
  span {
    font-weight: 500;
  }
`;

const mapContainerStyle = {
  height: "100%",
  width: "100%",
};
const mapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
};

const LOCATION_UPDATE_INTERVAL = 3000;

const LocationSharePage: React.FC = () => {
  // React-Router 및 Auth Context 훅
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // State 정의
  const [myPosition, setMyPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  // 동행 목록을 Map으로 관리 (userId를 key로 사용)
  const [companions, setCompanions] = useState<Map<number, Companion>>(
    new Map()
  );
  const [error, setError] = useState<string | null>(null);
  // 맵이 처음 로드될 때 중심을 잡았는지 확인하는 state
  const [mapCenter, setMapCenter] = useState<google.maps.LatLngLiteral | null>(
    null
  );
  // Stomp 클라이언트 Ref (re-render 방지)
  const stompClientRef = useRef<Client | null>(null);
  // Geolocation watch ID Ref
  const watchIdRef = useRef<number | null>(null);

  // state를 참조하기 위한 ref
  const isSharingRef = useRef(isSharing);
  const myPositionRef = useRef(myPosition);
  const userRef = useRef(user);

  // state가 변경될 때마다 ref의 .current 값을 업데이트
  useEffect(() => {
    isSharingRef.current = isSharing;
  }, [isSharing]);

  useEffect(() => {
    myPositionRef.current = myPosition;
  }, [myPosition]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Google Maps 로더
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

  // 내 위치 아이콘
  const myLocationIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
    };
  }, [isLoaded]);

  // 동행 위치 아이콘
  const companionIcon = useMemo(() => {
    if (!isLoaded) return undefined;
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: "#EA4335",
      fillOpacity: 1,
      strokeWeight: 3,
      strokeColor: "white",
      labelOrigin: new google.maps.Point(0, -2),
    };
  }, [isLoaded]);

  // 지도 제어 함수
  const centerOnMe = () => {
    if (myPositionRef.current) {
      setMapCenter(myPositionRef.current);
    }
  };
  const centerOnCompanion = (position: google.maps.LatLngLiteral) => {
    setMapCenter(position);
  };

  // WebSocket 메시지 전송 함수
  const sendMessage = useCallback(
    (type: LocationMessage["type"], position: google.maps.LatLngLiteral) => {
      const currentUser = userRef.current;
      if (!stompClientRef.current?.connected || !currentUser || !chatRoomId) {
        return;
      }

      const message = {
        type: type,
        userId: String(currentUser.id),
        userName: currentUser.name,
        groupId: chatRoomId,
        latitude: position.lat,
        longitude: position.lng,
        timestamp: 0,
      };

      stompClientRef.current.publish({
        destination: `/app/location/${chatRoomId}`,
        body: JSON.stringify(message),
      });
    },
    [chatRoomId]
  );

  // WebSocket 연결 및 구독 설정
  useEffect(() => {
    if (!chatRoomId || !user || !isLoaded) return;

    const token = getToken();
    if (!token) {
      setError("인증 토큰을 찾을 수 없습니다.");
      return;
    }

    const client = new Client({
      webSocketFactory: () =>
        new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws`),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (str) => console.log("STOMP DEBUG:", str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("STOMP 연결 성공");
        stompClientRef.current = client;

        // 동행 위치 구독
        client.subscribe(
          `/topic/location/${chatRoomId}`,
          (message) => {
            const newLocation: LocationMessage = JSON.parse(message.body);

            const receivedUserId = parseInt(newLocation.userId, 10);

            const currentUserId = userRef.current?.id;
            if (receivedUserId === currentUserId) return;

            setCompanions((prev) => {
              const newMap = new Map(prev);
              const newPos = {
                lat: newLocation.latitude,
                lng: newLocation.longitude,
              };

              // 'TALK' 메시지를 받아야만 동행 목록에 추가/업데이트
              if (newLocation.type === "TALK") {
                newMap.set(receivedUserId, {
                  userId: receivedUserId,
                  username: newLocation.userName,
                  position: newPos,
                });
              }
              // 'LEAVE' 메시지를 받으면 동행 목록에서 제거
              else if (newLocation.type === "LEAVE") {
                newMap.delete(receivedUserId);
              }

              return newMap;
            });
          },
          { Authorization: `Bearer ${token}` } // 구독 시 헤더 추가
        );

        // 첫 위치 가져오기
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const newPos = {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
            };
            setMyPosition(newPos);
            setMapCenter(newPos);
          },
          (err) => {
            console.error("초기 위치 가져오기 실패:", err);
            setError("위치 권한을 확인해주세요.");
          }
        );
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        setError("STOMP 연결에 실패했습니다.");
      },
    });

    client.activate();

    // Cleanup: 컴포넌트 언마운트 시
    return () => {
      if (client?.connected && myPositionRef.current && isSharingRef.current) {
        sendMessage("LEAVE", myPositionRef.current);
      }
      client?.deactivate();
      console.log("STOMP 연결 종료");
    };
  }, [chatRoomId, user?.id, isLoaded, sendMessage]);

  // 실시간 위치 추적
  useEffect(() => {
    if (isSharing) {
      // 공유 시작
      if (watchIdRef.current !== null) return; // 이미 실행 중

      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          // 내 화면의 마커는 즉시 부드럽게 업데이트
          setMyPosition(newPos);
        },
        (err) => {
          console.error("watchPosition 에러:", err);
          setError("실시간 위치 추적에 실패했습니다.");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      // 공유 중지
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    }

    // 컴포넌트 언마운트 시에도 watch 중지
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSharing]);

  // 위치를 서버에 전송
  useEffect(() => {
    let intervalId: number | null = null;

    if (isSharing) {
      // isSharing이 true가 되면 *초 간격 타이머 시작
      intervalId = window.setInterval(() => {
        // 일정 시간마다 myPositionRef(최신 위치)를 읽어서 서버로 전송
        if (myPositionRef.current) {
          console.log(
            `${LOCATION_UPDATE_INTERVAL / 1000}초 간격, 서버로 위치 전송`
          );
          sendMessage("TALK", myPositionRef.current);
        }
      }, LOCATION_UPDATE_INTERVAL);
    }

    // cleanup: isSharing이 false가 되거나, 컴포넌트가 언마운트되면
    return () => {
      if (intervalId !== null) {
        window.clearInterval(intervalId); // 타이머 중지
      }
    };
  }, [isSharing, sendMessage]);

  // 핸들러 함수
  const handleToggleSharing = () => {
    const newStatus = !isSharing;

    if (newStatus) {
      // 공유 시작
      // 'TALK' 메시지는 watchPosition useEffect가 보낼 것임
      console.log("위치 공유 시작");
      if (myPositionRef.current) {
        setMapCenter(myPositionRef.current);
      }
    } else {
      // 공유 중지
      console.log("위치 공유 중지");
      // 공유를 끄는 시점에 'LEAVE' 메시지를 명시적으로 전송
      if (myPositionRef.current) {
        sendMessage("LEAVE", myPositionRef.current);
      }
    }
    setIsSharing(newStatus); // watchPosition useEffect 트리거
  };

  // 렌더링 로직
  const companionsArray = Array.from(companions.values());

  const renderContent = () => {
    if (loadError)
      return <ErrorText>지도를 불러오는 데 실패했습니다.</ErrorText>;
    if (!isLoaded) return <StatusText>지도 로딩 중...</StatusText>;
    if (error) return <ErrorText>{error}</ErrorText>;
    if (!mapCenter) {
      return <StatusText>지도 로딩 및 위치 확인 중...</StatusText>;
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={15}
        options={mapOptions}
      >
        {myPosition && (
          <MarkerF position={myPosition} icon={myLocationIcon} zIndex={100} />
        )}
        {companionsArray.map((c) => (
          <MarkerF
            key={c.userId}
            position={c.position}
            icon={companionIcon}
            label={{
              text: c.username,
              color: "#333333",
              fontSize: "14px",
              fontWeight: "bold",
              className: "map-label",
            }}
          />
        ))}
      </GoogleMap>
    );
  };

  return (
    <PageLayout title="위치 공유" onBackClick={() => navigate(-1)}>
      <ControlsWrapper>
        <Button
          onClick={handleToggleSharing}
          $variant={isSharing ? "primary" : "secondary"}
          style={{ flex: 1 }}
          disabled={!myPosition} // 내 위치를 알아야 공유 가능
        >
          {isSharing ? "공유 중 (ON)" : "내 위치 공유"}
        </Button>
        <Button onClick={centerOnMe} disabled={!myPosition} style={{ flex: 1 }}>
          내 위치
        </Button>
      </ControlsWrapper>

      <MapWrapper>{renderContent()}</MapWrapper>

      <CompanionListWrapper>
        <h3>동행 목록 ({companionsArray.length}명)</h3>
        {companionsArray.length === 0 ? (
          <StatusText>현재 참여 중인 동행이 없습니다.</StatusText>
        ) : (
          companionsArray.map((c) => (
            <CompanionItem key={c.userId}>
              <span>{c.username}</span>
              <Button
                onClick={() => centerOnCompanion(c.position)}
                $size="small"
              >
                위치
              </Button>
            </CompanionItem>
          ))
        )}
      </CompanionListWrapper>
    </PageLayout>
  );
};

export default LocationSharePage;
