"use client";
import { useState } from "react";
import Link from "next/link";
import { FaPlay } from "react-icons/fa";

// Cycles through these colors for channel avatars based on card index
const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d"];

/**
 * VideoCard Component
 * Displays a single video thumbnail, title, channel name and view count.
 * Used inside grids on the Home page and other listing pages.
 * - Desktop: hover shows play overlay
 * - Mobile/touch: play overlay always visible (no hover support)
 */
export default function VideoCard({ video, index = 0 }) {
  const [hovered, setHovered] = useState(false); // Track hover for play overlay

  // Pick avatar color based on card position in the grid
  const color   = avatarColors[index % avatarColors.length];
  // First letter of channel name for avatar placeholder
  const initial = (video.user?.username || video.title || "F")[0].toUpperCase();

  return (
    <>
      {/* Responsive styles + animation */}
      <style>{`
        @keyframes vc-fadein { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* Card hover lift — desktop only */
        .vc-card { transition: transform 0.18s ease; animation: vc-fadein 0.25s ease; }
        .vc-card:hover { transform: translateY(-2px); }

        /* Play overlay:
           - Desktop: hidden until hover (controlled via React state)
           - Touch devices: always visible so users know it's tappable */
        @media (hover: none) {
          .vc-overlay { opacity: 1 !important; }
        }

        /* Info text truncation on very narrow cards */
        .vc-title {
          font-size: 13px;
          font-weight: 700;
          line-height: 1.35;
          color: var(--text);
          margin: 0 0 3px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          /* Prevent long words breaking layout on narrow screens */
          word-break: break-word;
        }

        .vc-meta {
          font-size: 12px;
          color: var(--text-muted);
          margin: 0;
          /* Truncate long channel names */
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      `}</style>

      <Link
        href={`/video/${video._id}`}
        className="vc-card"
        style={{ textDecoration: "none", color: "var(--text)", display: "block" }}
      >
        {/* ── Thumbnail container ── */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "16/9",   // Maintains correct ratio on all screen sizes
            borderRadius: "10px",
            overflow: "hidden",
            background: "#e53e3e22",
            border: "1px solid var(--border)",
          }}
          // Track hover state for play overlay visibility
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              // Fallback: extract YouTube video ID from embed URL and use ytimg
              const ytMatch = video.videoUrl?.match(/embed\/([a-zA-Z0-9_-]+)/);
              if (ytMatch) {
                e.target.src = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
              } else {
                e.target.style.display = "none";
              }
            }}
          />

          {/* ── Play overlay ──
              Shown on hover (desktop) or always (touch devices via CSS above) */}
          <div
            className="vc-overlay"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(0,0,0,0.15)",
              // React state controls opacity on desktop
              opacity: hovered ? 1 : 0,
              transition: "opacity 0.2s",
            }}
          >
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}>
              <FaPlay size={18} color="#fff" style={{ marginLeft: "3px" }} />
            </div>
          </div>
        </div>

        {/* ── Video info row ── */}
        <div style={{
          display: "flex",
          gap: "10px",
          marginTop: "10px",
          alignItems: "flex-start",
        }}>
          {/* Channel avatar — first letter of username, colored by index */}
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: color,
            flexShrink: 0, // Never shrink avatar on narrow cards
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "700",
          }}>
            {initial}
          </div>

          {/* Text info — min-width 0 prevents overflow on narrow grid columns */}
          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Title — clamped to 2 lines, long words break cleanly */}
            <p className="vc-title">{video.title}</p>

            {/* Channel name — truncated with ellipsis if too long */}
            <p className="vc-meta">{video.user?.username || "FluxTube User"}</p>

            {/* View count */}
            <p className="vc-meta">{video.views || 0} views</p>
          </div>
        </div>
      </Link>
    </>
  );
}