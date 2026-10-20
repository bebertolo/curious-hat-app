// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Feed } from "./pages/Feed";
import { NewGossip } from "./pages/NewGossip";
import { GossipDetail } from "./pages/GossipDetail";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-black text-white flex flex-col md:flex-row max-w-5xl mx-auto border-x border-white/40">
        {/* Menu Lateral (Desktop) / Topo (Mobile) */}
        <Navbar />

        {/* Conteúdo Principal das 3 Telas */}
        <main className="flex-1 min-h-screen bg-black">
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/novo" element={<NewGossip />} />
            <Route path="/fofoca/:id" element={<GossipDetail />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}