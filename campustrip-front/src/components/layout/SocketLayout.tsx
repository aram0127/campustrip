import { Outlet } from "react-router-dom";
import { WebSocketProvider } from "../../context/WebSocketContext";

const SocketLayout = () => {
    return (
        <WebSocketProvider>
            <Outlet />
        </WebSocketProvider>
    );
};

export default SocketLayout;
