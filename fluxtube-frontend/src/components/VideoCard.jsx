import Link from "next/link";
import { FaPlay } from "react-icons/fa";

const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d"];

export default function VideoCard({ video, index = 0 }) {
  const color = avatarColors[index % avatarColors.length];
  const initial = (video.user?.username || video.title || "F")[0].toUpperCase();

  return (
    <Link href={`/video/${video._id}`} style={{ textDecoration: "none", color: "var(--text)", display: "block" }}>
      <div>
        <div style={{
          position: "relative", width: "100%",
          aspectRatio: "16/9", borderRadius: "10px",
          overflow: "hidden", background: "#e53e3e22",
          border: "1px solid var(--border)",
        }}>
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            referrerPolicy="no-referrer"
            crossOrigin="anonymous"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
            onError={(e) => {
              const ytMatch = video.videoUrl?.match(/embed\/([a-zA-Z0-9_-]+)/);
              if (ytMatch) {
                e.target.src = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
              } else {
                e.target.style.display = "none";
              }
            }}
          />

          {/* Play overlay */}
          <div
            style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(0,0,0,0.15)",
              opacity: 0,
              transition: "opacity 0.2s",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "1"}
            onMouseLeave={e => e.currentTarget.style.opacity = "0"}
          >
            <div style={{
              width: "48px", height: "48px", borderRadius: "50%",
              background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <FaPlay size={18} color="#fff" style={{ marginLeft: "3px" }} />
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "flex-start" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "50%",
            background: color, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: "13px", fontWeight: "700",
          }}>
            {initial}
          </div>
          <div>
            <p style={{
              fontSize: "13px", fontWeight: "700", lineHeight: "1.35",
              color: "var(--text)",
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {video.title}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>
              {video.user?.username || "FluxTube User"}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
              {video.views || 0} views
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}