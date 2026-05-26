"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProtectedRoute from "../components/ProtectedRoute";
import { MdVideoLibrary } from "react-icons/md";
import { FaPlay, FaUpload } from "react-icons/fa";
import api from "../lib/api";

const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d"];

function HomeContent() {
  const router = useRouter();
  const [videos, setVideos]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // ── Fetch the logged-in user's videos on mount ──
  useEffect(() => {
    const stored = localStorage.getItem("fluxtubeUser");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);

      api.get("/videos")
        .then(({ data }) => {
          // Filter to only show videos uploaded by the current user
          const myVideos = data.filter(v =>
            v.user?._id === user._id ||
            v.user?.id  === user._id ||
            v.user      === user._id
          );
          setVideos(myVideos);
        })
        .catch(() => setVideos([]))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Responsive styles */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Video grid breakpoints ──
           Desktop  (768px+) : 3 columns
           Tablet   (480-767px) : 2 columns
           Mobile   (<480px) : 1 column  */
        .home-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px 14px;
        }
        @media (max-width: 767px) {
          .home-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; }
        }
        @media (max-width: 479px) {
          .home-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        /* ── Header row: stack on mobile ── */
        .home-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
          gap: 12px;
        }
        @media (max-width: 479px) {
          .home-header {
            flex-direction: column;
            align-items: flex-start;
          }
          .home-upload-btn {
            width: 100%;
            justify-content: center;
          }
        }

        /* ── Main padding reduces on mobile ── */
        .home-main {
          flex: 1;
          padding: 24px 28px;
          overflow-x: hidden;
        }
        @media (max-width: 640px) {
          .home-main { padding: 16px 14px; }
        }

        /* ── Video card hover lift ── */
        .home-card {
          cursor: pointer;
          transition: transform 0.18s ease;
        }
        .home-card:hover { transform: translateY(-2px); }

        /* ── Play overlay: always visible on touch devices ── */
        .home-overlay { opacity: 0; transition: opacity 0.2s; }
        .home-card:hover .home-overlay { opacity: 1; }
        @media (hover: none) {
          .home-overlay { opacity: 1 !important; }
        }

        /* ── Prevent text overflow on narrow cards ── */
        .home-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--text);
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          word-break: break-word;
        }
        .home-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin: 3px 0 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />

        <main className="home-main">

          {/* ── Page header ── */}
          <div className="home-header">
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)", margin: 0 }}>
                My Videos
              </h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px", margin: "4px 0 0" }}>
                Videos you've uploaded to FluxTube
              </p>
            </div>

            {/* Upload button — full width on mobile */}
            <button
              className="home-upload-btn"
              onClick={() => router.push("/upload")}
              style={{
                display: "flex", alignItems: "center", gap: "8px",
                padding: "10px 20px", borderRadius: "10px",
                background: "#e53e3e", color: "#fff",
                border: "none", fontWeight: "700", fontSize: "14px",
                cursor: "pointer", flexShrink: 0,
              }}
            >
              <FaUpload size={13} /> Upload Video
            </button>
          </div>

          {/* ── Loading spinner ── */}
          {loading && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "60px", flexDirection: "column", gap: "12px",
            }}>
              <div style={{
                width: "36px", height: "36px",
                border: "3px solid var(--border)",
                borderTop: "3px solid #e53e3e",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }} />
              <p style={{ color: "var(--text-muted)", fontSize: "13px", margin: 0 }}>
                Loading your videos...
              </p>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && videos.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <MdVideoLibrary size={64} color="#e53e3e" style={{ marginBottom: "16px", opacity: 0.7 }} />
              <p style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>
                No videos yet
              </p>
              <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "24px", lineHeight: "1.6" }}>
                You haven't uploaded anything yet. Share your first video!
              </p>
              <button
                onClick={() => router.push("/upload")}
                style={{
                  display: "inline-flex", alignItems: "center", gap: "8px",
                  padding: "12px 28px", borderRadius: "10px",
                  background: "#e53e3e", color: "#fff",
                  border: "none", fontWeight: "700", fontSize: "15px",
                  cursor: "pointer",
                }}
              >
                <FaUpload size={14} /> Upload Your First Video
              </button>
            </div>
          )}

          {/* ── Video grid ── */}
          {!loading && videos.length > 0 && (
            <div className="home-grid">
              {videos.map((video, i) => {
                const color   = avatarColors[i % avatarColors.length];
                // Use first letter of username for avatar
                const initial = (currentUser?.username || "U")[0].toUpperCase();

                // Derive thumbnail — fallback to YouTube img if no thumbnailUrl
                let thumb = video.thumbnailUrl;
                if (!thumb) {
                  const ytMatch = video.videoUrl?.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                  if (ytMatch) thumb = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                }

                return (
                  <div
                    key={video._id}
                    className="home-card"
                    onClick={() => router.push(`/video/${video._id}`)}
                  >
                    {/* ── Thumbnail ── */}
                    <div style={{
                      position: "relative", width: "100%",
                      aspectRatio: "16/9",   // Maintains ratio at any card width
                      borderRadius: "10px", overflow: "hidden",
                      background: "#e53e3e22", border: "1px solid var(--border)",
                    }}>
                      {thumb ? (
                        <img
                          src={thumb}
                          alt={video.title}
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          onError={e => { e.target.style.display = "none"; }}
                        />
                      ) : (
                        // Fallback when no thumbnail at all
                        <div style={{
                          width: "100%", height: "100%",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <MdVideoLibrary size={32} color="#e53e3e" />
                        </div>
                      )}

                      {/* Play overlay — hidden until hover on desktop,
                          always visible on touch via CSS above */}
                      <div className="home-overlay" style={{
                        position: "absolute", inset: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        background: "rgba(0,0,0,0.15)",
                      }}>
                        <div style={{
                          width: "48px", height: "48px", borderRadius: "50%",
                          background: "rgba(0,0,0,0.7)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <FaPlay size={18} color="#fff" style={{ marginLeft: "3px" }} />
                        </div>
                      </div>

                      {/* Visibility badge — only shown for unlisted/private */}
                      {video.visibility && video.visibility !== "public" && (
                        <div style={{
                          position: "absolute", top: "7px", left: "7px",
                          background: "rgba(0,0,0,0.75)", color: "#fff",
                          fontSize: "10px", fontWeight: "700",
                          padding: "2px 7px", borderRadius: "4px",
                          textTransform: "capitalize",
                        }}>
                          {video.visibility}
                        </div>
                      )}
                    </div>

                    {/* ── Video info row ── */}
                    <div style={{
                      display: "flex", gap: "10px",
                      marginTop: "10px", alignItems: "flex-start",
                    }}>
                      {/* Avatar — never shrinks on narrow cards */}
                      <div style={{
                        width: "34px", height: "34px", borderRadius: "50%",
                        background: color, flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#fff", fontSize: "13px", fontWeight: "700",
                      }}>
                        {initial}
                      </div>

                      {/* Text — minWidth 0 stops overflow on narrow grid columns */}
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <p className="home-title">{video.title}</p>
                        <p className="home-meta">{currentUser?.username || "You"}</p>
                        {video.views > 0 && (
                          <p className="home-meta">{video.views} views</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <ProtectedRoute pageName="FluxTube">
      <HomeContent />
    </ProtectedRoute>
  );
}