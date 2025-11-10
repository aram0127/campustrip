export interface LocationMessage {
  type: "ENTER" | "LEAVE" | "TALK"; // 'TALK'가 실시간 위치 전송용
  chatRoomId: string;
  userId: number;
  username: string;
  lat: number;
  lng: number;
}

// 지도에 표시할 동행의 상태 타입
export interface Companion {
  userId: number;
  username: string;
  position: google.maps.LatLngLiteral;
}
