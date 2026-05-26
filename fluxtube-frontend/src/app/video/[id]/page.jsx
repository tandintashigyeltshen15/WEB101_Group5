"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "../../../lib/api";
import ProtectedRoute from "../../../components/ProtectedRoute";

const AVATAR_COLORS = ["#e53e3e","#7c3aed","#2563eb","#16a34a","#ea580c","#db2777"];

function getUser() {
  try {
    const u = localStorage.getItem("fluxtubeUser");
    return u ? JSON.parse(u) : null;
  } catch { return null; }
}

function VideoContent({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const [video, setVideo] = useState(null);
  const [related, setRelated] = useState([]);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [likeCount, setLikeCount] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  const user = getUser();

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Increment view separately
        api.put(`/videos/${id}/view`).catch(() => {});

        const { data } = await api.get(`/videos/${id}`);
        setVideo(data);
        setLikeCount(data.likes || 0);
        setViewCount((data.views || 0) + 1); // +1 for current view

        const all = await api.get("/videos");
        setRelated(all.data.filter(v => v._id !== id).slice(0, 8));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Check if already liked (stored in localStorage)
  useEffect(() => {
    const likedVideos = JSON.parse(localStorage.getItem("likedVideos") || "[]");
    if (likedVideos.includes(id)) setLiked(true);
  }, [id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      await api.put(`/videos/${id}/like`);
      setLikeCount(prev => prev + 1);
      setLiked(true);
      // Remember liked state
      const likedVideos = JSON.parse(localStorage.getItem("likedVideos") || "[]");
      localStorage.setItem("likedVideos", JSON.stringify([...likedVideos, id]));
    } catch (err) {
      console.error("Like failed:", err);
      alert("Failed to like. Please try again.");
    }
  };

  const handleComment = () => {
    if (!comment.trim()) return;
    const newComment = {
      id: Date.now(),
      user: user?.username || "You",
      text: comment.trim(),
      time: "Just now",
      avatar: AVATAR_COLORS[(user?.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length],
    };
    setComments(prev => [newComment, ...prev]);
    setComment("");
  };

  const handleDelete = async () => {
    if (!confirm("Delete this video?")) return;
    try {
      await api.delete(`/videos/${id}`);
      router.push("/");
    } catch {
      alert("Failed to delete video.");
    }
  };

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh", flexDirection: "column", gap: "12px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading video...</p>
    </div>
  );

  if (!video) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "80vh", gap: "12px" }}>
      <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>Video not found</p>
      <Link href="/" style={{ color: "#e53e3e", textDecoration: "none" }}>← Back to Home</Link>
    </div>
  );

  // Determine if it's a YouTube embed or a local file
  const isYouTube = video.videoUrl?.includes("youtube.com/embed");
  // Fix local video URL — make sure it's a full URL
  const videoSrc = video.videoUrl?.startsWith("http")
    ? video.videoUrl
    : `http://localhost:5000${video.videoUrl}`;

  const channelInitial = (video.user?.username || "F")[0].toUpperCase();
  const avatarColor = AVATAR_COLORS[channelInitial.charCodeAt(0) % AVATAR_COLORS.length];
  const isOwner = user && (video.user?._id === user._id || video.user?._id === user.id);

  return (
    <div style={{ display: "flex", gap: "24px", padding: "24px", maxWidth: "1400px", margin: "0 auto", flexWrap: "wrap", color: "var(--text)" }}>
      <div style={{ flex: "1 1 640px", minWidth: 0 }}>

        {/* ── Video Player ── */}
        <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "12px", overflow: "hidden", background: "#000", marginBottom: "16px" }}>
          {isYouTube ? (
            <iframe
              src={video.videoUrl + "?autoplay=1&rel=0"}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ width: "100%", height: "100%", border: "none" }}
            />
          ) : video.videoUrl ? (
            <video
              controls
              autoPlay
              style={{ width: "100%", height: "100%", background: "#000" }}
              key={videoSrc}
            >
              <source src={videoSrc} />
              Your browser does not support video playback.
            </video>
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#111", color: "#666", fontSize: "14px" }}>
              No video source
            </div>
          )}
        </div>

        {/* ── Title ── */}
        <h1 style={{ fontSize: "18px", fontWeight: "700", lineHeight: "1.4", marginBottom: "12px" }}>
          {video.title}
        </h1>

        {/* ── Channel + Actions ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginBottom: "16px", paddingBottom: "16px", borderBottom: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", fontWeight: "700", color: "#fff" }}>
              {channelInitial}
            </div>
            <div>
              <p style={{ fontWeight: "600", fontSize: "14px", margin: 0 }}>{video.user?.username || "FluxTube User"}</p>
              <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>{viewCount} views</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {/* Like */}
            <button
              onClick={handleLike}
              disabled={liked}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 16px", borderRadius: "999px", border: "none",
                cursor: liked ? "default" : "pointer",
                background: liked ? "#e53e3e" : "var(--chip-bg)",
                color: liked ? "#fff" : "var(--text)",
                fontSize: "13px", fontWeight: "600",
                transition: "background 0.2s",
              }}
            >
              👍 {likeCount} {liked ? "Liked" : "Like"}
            </button>

            {/* Share */}
            <button
              onClick={() => { navigator.clipboard.writeText(window.location.href); alert("Link copied!"); }}
              style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", border: "none", cursor: "pointer", background: "var(--chip-bg)", color: "var(--text)", fontSize: "13px", fontWeight: "600" }}
            >
              🔗 Share
            </button>

            {/* Delete (owner only) */}
            {isOwner && (
              <button
                onClick={handleDelete}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "999px", border: "none", cursor: "pointer", background: "#fff1f1", color: "#e53e3e", fontSize: "13px", fontWeight: "600" }}
              >
                🗑 Delete
              </button>
            )}
          </div>
        </div>

        {/* ── Description ── */}
        <div style={{ background: "var(--chip-bg)", borderRadius: "12px", padding: "16px", marginBottom: "24px" }}>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.6", margin: 0 }}>
            {video.description || "No description."}
          </p>
        </div>

        {/* ── Comments ── */}
        <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px" }}>
          {comments.length} Comment{comments.length !== 1 ? "s" : ""}
        </h3>

        {/* Add comment */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", alignItems: "flex-start" }}>
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
            background: AVATAR_COLORS[(user?.username?.charCodeAt(0) || 0) % AVATAR_COLORS.length],
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "14px", fontWeight: "700", color: "#fff",
          }}>
            {user?.username?.[0]?.toUpperCase() || "?"}
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleComment(); }}
              style={{
                width: "100%", padding: "10px 0", border: "none",
                borderBottom: "1px solid var(--border)", background: "transparent",
                color: "var(--text)", fontSize: "14px", outline: "none",
              }}
            />
            {comment.trim() && (
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                <button onClick={() => setComment("")} style={{ padding: "6px 14px", borderRadius: "999px", border: "none", background: "transparent", color: "var(--text)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={handleComment} style={{ padding: "6px 14px", borderRadius: "999px", border: "none", background: "#e53e3e", color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                  Comment
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Comment list */}
        {comments.length === 0 ? (
          <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", padding: "24px 0" }}>
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {comments.map(c => (
              <div key={c.id} style={{ display: "flex", gap: "12px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0,
                  background: c.avatar, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: "13px", fontWeight: "700", color: "#fff",
                }}>
                  {c.user[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ display: "flex", gap: "8px", alignItems: "baseline", marginBottom: "4px" }}>
                    <p style={{ fontSize: "13px", fontWeight: "700", margin: 0 }}>{c.user}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{c.time}</p>
                  </div>
                  <p style={{ fontSize: "14px", lineHeight: "1.5", margin: 0 }}>{c.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Related Videos ── */}
      <div style={{ width: "360px", flexShrink: 0 }}>
        <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "14px" }}>Up Next</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {related.length === 0 ? (
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>No related videos.</p>
          ) : (
            related.map((v) => {
              let thumb = v.thumbnailUrl;
              if (!thumb) {
                const ytMatch = v.videoUrl?.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                if (ytMatch) thumb = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
              }
              return (
                <Link key={v._id} href={`/video/${v._id}`} style={{ textDecoration: "none", color: "var(--text)", display: "flex", gap: "10px" }}>
                  <div style={{ width: "160px", flexShrink: 0, aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "var(--chip-bg)", position: "relative" }}>
                    {thumb ? (
                      <img src={thumb} alt={v.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.style.display = "none"; }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: "#e53e3e22", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", color: "#e53e3e" }}>
                        No thumb
                      </div>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: "13px", fontWeight: "600", lineHeight: "1.3", margin: "0 0 4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {v.title}
                    </p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: "0 0 2px" }}>{v.user?.username || "FluxTube User"}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", margin: 0 }}>{v.views || 0} views</p>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoPage({ params }) {
  return (
    <ProtectedRoute pageName="this video">
      <VideoContent params={params} />
    </ProtectedRoute>
  );
}