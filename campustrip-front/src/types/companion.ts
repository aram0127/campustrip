export interface LocationMessage {
  type: "ENTER" | "LEAVE" | "TALK";
  groupId: string;
  userId: string;
  userName: string;
  latitude: number;
  longitude: number;
  timestamp?: number;
}

// 지도에 표시할 동행의 상태 타입
export interface Companion {
  userId: number;
  username: string;
  position: google.maps.LatLngLiteral;
}
