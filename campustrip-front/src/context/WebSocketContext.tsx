import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Client, type IMessage, type StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useAuth } from "./AuthContext";
import { getToken } from "../utils/token";

interface WebSocketContextType {
    isConnected: boolean;
    subscribe: (destination: string, callback: (message: IMessage) => void) => StompSubscription | null;
    publish: (destination: string, body: any) => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { user } = useAuth();
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        // 로그아웃 상태거나 유저 정보가 없으면 연결 해제
        if (!user) {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // 이미 연결된 상태라면 스킵 (단, 토큰 갱신 등의 이슈가 있다면 재연결 로직 필요)
        if (clientRef.current && clientRef.current.active) {
            return;
        }

        // STOMP 클라이언트 생성
        const client = new Client({
            brokerURL: `${import.meta.env.VITE_API_BASE_URL.replace("http", "ws")}/ws/chat`,
            webSocketFactory: () => new SockJS(`${import.meta.env.VITE_API_BASE_URL}/ws/chat`),
            connectHeaders: {
                Authorization: getToken() || "",
            },
            debug: (_str) => {
                // 개발 모드에서만 로그 출력하도록 설정 가능
                // console.log(new Date(), str);
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        client.onConnect = () => {
            console.log("Global WebSocket Connected");
            setIsConnected(true);
        };

        client.onStompError = (frame) => {
            console.error("Broker reported error: " + frame.headers["message"]);
            console.error("Additional details: " + frame.body);
        };

        client.onWebSocketClose = () => {
            console.log("WebSocket Closed");
            setIsConnected(false);
        };

        client.activate();
        clientRef.current = client;

        // 컴포넌트 언마운트 시(앱 종료 등) 연결 해제
        return () => {
            if (clientRef.current) {
                clientRef.current.deactivate();
                clientRef.current = null;
                setIsConnected(false);
            }
        };
    }, [user]);

    const subscribe = (destination: string, callback: (message: IMessage) => void) => {
        if (!clientRef.current || !clientRef.current.active) {
            console.warn("WebSocket is not connected. Cannot subscribe.");
            return null;
        }
        return clientRef.current.subscribe(destination, callback);
    };

    const publish = (destination: string, body: any) => {
        if (!clientRef.current || !clientRef.current.active) {
            console.warn("WebSocket is not connected. Cannot publish.");
            return;
        }
        clientRef.current.publish({
            destination,
            body: JSON.stringify(body),
        });
    };

    return (
        <WebSocketContext.Provider value={{ isConnected, subscribe, publish }}>
            {children}
        </WebSocketContext.Provider>
    );
};

export const useWebSocket = () => {
    const context = useContext(WebSocketContext);
    if (!context) {
        throw new Error("useWebSocket must be used within a WebSocketProvider");
    }
    return context;
};
