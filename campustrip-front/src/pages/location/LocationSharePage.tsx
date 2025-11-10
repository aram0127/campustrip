import React, { useState, useEffect, useCallback, useMemo } from "react";
import styled from "styled-components";
import { GoogleMap, useJsApiLoader, MarkerF } from "@react-google-maps/api";
import PageLayout from "../../components/layout/PageLayout";
import Button from "../../components/common/Button";
import { type Companion } from "../../types/companion";

// 임시 데이터
// 실제로는 API로 이 동행 목록을 받아와야함
const MOCK_COMPANIONS: Companion[] = [
  {
    id: "comp-1",
    name: "김여행",
    position: { lat: 37.5665, lng: 126.978 },
  },
  {
    id: "comp-2",
    name: "이동행",
    position: { lat: 37.565, lng: 126.979 },
  },
];

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
  const [myPosition, setMyPosition] =
    useState<google.maps.LatLngLiteral | null>(null);
  const [isSharing, setIsSharing] = useState(false); // 위치 공유 On/Off 상태
  const [companions, setCompanions] = useState<Companion[]>([]); // 동행 목록 상태
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null); // 지도 인스턴스 제어
  const [error, setError] = useState<string | null>(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey || "",
  });

  // '내 위치' 마커를 위한 커스텀 아이콘
  const myLocationIcon = useMemo(() => {
    if (!isLoaded) {
      return undefined;
    }
    return {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8,
      fillColor: "#4285F4",
      fillOpacity: 1,
      strokeWeight: 2,
      strokeColor: "white",
    };
  }, [isLoaded]);

  // 지도 인스턴스를 state에 저장
  const onLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMapRef(null);
  }, []);

  // 특정 위치로 지도를 이동시키는 함수
  const centerOn = (position: google.maps.LatLngLiteral) => {
    mapRef?.panTo(position);
    mapRef?.setZoom(15);
  };

  // 내 위치 정보 가져오기
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("이 브라우저에서는 위치 공유를 지원하지 않습니다.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setMyPosition(newPos);
      },
      (err) => {
        if (err.code === 1) {
          setError("위치 정보 접근이 거부되었습니다. 권한을 확인해주세요.");
        } else {
          setError("위치 정보를 가져오는 데 실패했습니다.");
        }
      }
    );
  }, []);

  // (가정) 동행 목록 API 연결
  useEffect(() => {
    // TODO: 실제로는 여기서 API를 호출, 동행 목록 및 위치를 받아와 setCompanions로 업데이트
    setCompanions(MOCK_COMPANIONS);
  }, []);

  // 위치 공유 On/Off 핸들러
  const handleToggleSharing = () => {
    const newStatus = !isSharing;
    setIsSharing(newStatus);

    if (newStatus) {
      // TODO: 백엔드에 "위치 공유 시작" 알림
      console.log("위치 공유 시작");
      // 공유 시작 시 내 위치로 자동 이동
      if (myPosition) {
        centerOn(myPosition);
      }
    } else {
      // TODO: 백엔드에 "위치 공유 중지" 알림
      console.log("위치 공유 중지");
    }
  };

  // '내 위치' 버튼 핸들러
  const handleCenterOnMe = () => {
    if (myPosition) {
      centerOn(myPosition);
    } else {
      alert("아직 내 위치를 가져오지 못했습니다.");
    }
  };

  // 지도 렌더링 로직
  const renderContent = () => {
    if (loadError) {
      return <ErrorText>지도를 불러오는 데 실패했습니다.</ErrorText>;
    }
    if (!isLoaded) {
      return <StatusText>지도 로딩 중...</StatusText>;
    }
    if (error) {
      return <ErrorText>{error}</ErrorText>;
    }
    if (!myPosition && companions.length === 0) {
      return <StatusText>위치 정보를 가져오는 중...</StatusText>;
    }

    // 지도의 기본 중심 위치 설정 (내 위치 우선, 없으면 첫번째 동행 위치)
    const defaultCenter = myPosition || companions[0]?.position;

    if (!defaultCenter) {
      return <StatusText>표시할 위치가 없습니다.</StatusText>;
    }

    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={defaultCenter}
        zoom={15}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {/* 내 위치 마커 (파란색 원으로 표시) */}
        {myPosition && <MarkerF position={myPosition} icon={myLocationIcon} />}

        {/* 동행 위치 마커 (기본 마커) */}
        {companions.map((c) => (
          <MarkerF key={c.id} position={c.position} label={c.name} />
        ))}
      </GoogleMap>
    );
  };

  return (
    <PageLayout title="위치 공유">
      {/* 컨트롤 버튼 영역 */}
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

      {/* 지도 영역 */}
      <MapWrapper>{renderContent()}</MapWrapper>

      {/* 동행 목록 영역 */}
      <CompanionListWrapper>
        <h3>동행 목록</h3>
        {companions.length === 0 ? (
          <StatusText>표시할 동행이 없습니다.</StatusText>
        ) : (
          companions.map((c) => (
            <CompanionItem key={c.id}>
              <span>{c.name}</span>
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
