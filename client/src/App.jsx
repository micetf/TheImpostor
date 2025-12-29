// client/src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SocketProvider } from "./contexts/SocketContext";
import Home from "./pages/Home";
import Lobby from "./pages/Lobby";

export default function App() {
    return (
        <SocketProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/lobby/:roomId" element={<Lobby />} />
                </Routes>
            </BrowserRouter>
        </SocketProvider>
    );
}
