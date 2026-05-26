"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import VideoFeed from "../../components/VideoFeed";
import ProtectedRoute from "../../components/ProtectedRoute";

const chips = [
  { label: "All", query: null },
  { label: "New to you", query: "trending 2025" },
  { label: "Music", query: "music" },
  { label: "Mixes", query: "music mix playlist" },
  { label: "Mukbang", query: "mukbang" },
  { label: "Gaming", query: "gaming" },
  { label: "Live", query: "live stream" },
  { label: "News", query: "news" },
  { label: "Sports", query: "sports" },
  { label: "Learning", query: "learning" },
  { label: "Fashion", query: "fashion" },
];

function ExploreContent() {
  const [activeChip, setActiveChip] = useState(chips[0]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "16px 20px", overflowX: "hidden" }}>

          <div style={{ marginBottom: "18px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)", margin: 0 }}>Explore</h1>
            <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
              Discover videos across all categories
            </p>
          </div>

          <div style={{
            display: "flex", gap: "8px", marginBottom: "16px",
            overflowX: "auto", paddingBottom: "4px",
          }}>
            {chips.map((chip) => (
              <button
                key={chip.label}
                onClick={() => setActiveChip(chip)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "13px",
                  fontWeight: "500",
                  background: activeChip.label === chip.label ? "var(--text)" : "var(--chip-bg)",
                  color: activeChip.label === chip.label ? "var(--bg)" : "var(--chip-text)",
                  border: "none",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "background 0.2s, color 0.2s",
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>

          <VideoFeed category={activeChip.label} ytQuery={activeChip.query} />
        </main>
      </div>
    </div>
  );
}

export default function ExplorePage() {
  return (
    <ProtectedRoute pageName="Explore">
      <ExploreContent />
    </ProtectedRoute>
  );
}