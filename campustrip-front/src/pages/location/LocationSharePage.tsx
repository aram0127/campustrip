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
import { useParams } from "react-router-dom";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";
import { AuthContext } from "../../context/AuthContext";
import { type LocationMessage, type Companion } from "../../types/companion";

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

const LocationSharePage: React.FC = () => {
  // React-Router 및 Auth Context 훅
  const { chatRoomId } = useParams<{ chatRoomId: string }>();
  const { user } = useContext(AuthContext);

  // State 정의
  const [myPosition, setMyPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  // 동행 목록을 Map으로 관리 (userId를 key로 사용)
  const [companions, setCompanions] = useState<Map<number, Companion>>(
    new Map()
  );
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Stomp 클라이언트 Ref (re-render 방지)
  const stompClientRef = useRef<Client | null>(null);
  // Geolocation watch ID Ref
  const watchIdRef = useRef<number | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Google Maps 로더
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

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

  // 지도 제어 함수
  const onLoad = useCallback((map: google.maps.Map) => setMapRef(map), []);
  const onUnmount = useCallback(() => setMapRef(null), []);
  const centerOn = (position: google.maps.LatLngLiteral) => {
    mapRef?.panTo(position);
    mapRef?.setZoom(15);
  };

  // WebSocket 메시지 전송 함수
  const sendMessage = useCallback(
    (type: LocationMessage["type"], position: google.maps.LatLngLiteral) => {
      if (!stompClientRef.current?.connected || !user || !chatRoomId) return;

      const message: LocationMessage = {
        type: type,
        chatRoomId: chatRoomId,
        userId: user.id,
        username: user.name,
        lat: position.lat,
        lng: position.lng,
      };
      stompClientRef.current.publish({
        destination: `/app/location/share/${chatRoomId}`,
        body: JSON.stringify(message),
      });
    },
    [user, chatRoomId]
  );

  // WebSocket 연결 및 구독 설정
  useEffect(() => {
    if (!chatRoomId || !user || !isLoaded) return;

    const token = localStorage.getItem("authToken");
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

            // 본인 위치는 watchPosition이 처리하므로 무시
            if (newLocation.userId === user.id) return;

            setCompanions((prev) => {
              const newMap = new Map(prev);
              const newPos = {
                lat: newLocation.lat,
                lng: newLocation.lng,
              };

              if (newLocation.type === "LEAVE") {
                newMap.delete(newLocation.userId);
              } else {
                // ENTER 또는 TALK(위치전송)
                newMap.set(newLocation.userId, {
                  userId: newLocation.userId,
                  username: newLocation.username,
                  position: newPos,
                });
              }
              return newMap;
            });
          },
          { Authorization: `Bearer ${token}` } // 구독 시 헤더 추가
        );

        // 첫 위치 가져오기 및 'ENTER' 메시지 전송
        navigator.geolocation.getCurrentPosition((pos) => {
          const newPos = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setMyPosition(newPos);
          sendMessage("ENTER", newPos); // "입장" 메시지 전송
        });
      },
      onStompError: (frame) => {
        console.error("STOMP 에러:", frame);
        setError("STOMP 연결에 실패했습니다.");
      },
    });

    client.activate();

    // Cleanup: 컴포넌트 언마운트 시 'LEAVE' 메시지 전송 및 연결 종료
    return () => {
      if (client?.connected && myPosition) {
        sendMessage("LEAVE", myPosition);
      }
      client?.deactivate();
      console.log("STOMP 연결 종료");
    };
  }, [chatRoomId, user, isLoaded, sendMessage, myPosition]); // myPosition 추가 (LEAVE 시 필요)

  // 실시간 위치 추적 및 전송
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
          setMyPosition(newPos); // 내 마커 업데이트
          sendMessage("TALK", newPos); // 실시간 위치 'TALK'로 전송
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
  }, [isSharing, sendMessage]); // isSharing 상태가 바뀔 때마다 실행

  // 핸들러 함수
  const handleToggleSharing = () => {
    setIsSharing((prev) => !prev);
    if (!isSharing && myPosition) {
      centerOn(myPosition); // 공유 시작 시 내 위치로 이동
    }
  };

  const handleCenterOnMe = () => {
    if (myPosition) centerOn(myPosition);
  };

  // 렌더링 로직
  const companionsArray = Array.from(companions.values());

  const renderContent = () => {
    if (loadError)
      return <ErrorText>지도를 불러오는 데 실패했습니다.</ErrorText>;
    if (!isLoaded) return <StatusText>지도 로딩 중...</StatusText>;
    if (error) return <ErrorText>{error}</ErrorText>;
    if (!myPosition && companionsArray.length === 0) {
      return <StatusText>위치 정보를 가져오는 중...</StatusText>;
    }

    const defaultCenter = myPosition || companionsArray[0]?.position;
    if (!defaultCenter) return <StatusText>표시할 위치가 없습니다.</StatusText>;

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={15}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {myPosition && <MarkerF position={myPosition} icon={myLocationIcon} />}
        {companionsArray.map((c) => (
          <MarkerF key={c.userId} position={c.position} label={c.username} />
        ))}
      </GoogleMap>
    );
  };

  return (
    <PageLayout title="위치 공유">
      <ControlsWrapper>
        <Button
          onClick={handleToggleSharing}
          variant={isSharing ? "primary" : "secondary"}
          style={{ flex: 1 }}
        >
          {isSharing ? "공유 중 (ON)" : "공유 중지 (OFF)"}
        </Button>
        <Button
          onClick={handleCenterOnMe}
          disabled={!myPosition}
          style={{ flex: 1 }}
        >
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
              <Button onClick={() => centerOn(c.position)} size="small">
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
