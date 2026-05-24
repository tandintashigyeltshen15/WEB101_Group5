"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { MdVideoLibrary } from "react-icons/md";
import { FaPlay, FaYoutube } from "react-icons/fa";
import api from "../lib/api";

const PAGE_SIZE = 9;
const YT_API_KEY ="AIzaSyCXu-L2Bf_niq3cWm26d_pJeR3YKZo-FVM";

export default function VideoFeed({ category, ytQuery }) {
  const [allVideos, setAllVideos] = useState([]);
  const [displayed, setDisplayed] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isYouTube, setIsYouTube] = useState(false);
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    setAllVideos([]);
    setDisplayed([]);
    setHasMore(true);

    if (ytQuery) {
      // Fetch from YouTube
      setIsYouTube(true);
      fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(ytQuery)}&type=video&maxResults=20&key=${YT_API_KEY}`)
        .then(r => r.json())
        .then(data => {
          const items = (data.items || []).map(item => ({
            _id: item.id.videoId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails?.high?.url,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            user: { username: item.snippet.channelTitle },
            views: "",
            isYouTube: true,
          }));
          setAllVideos(items);
          setDisplayed(items.slice(0, PAGE_SIZE));
          setHasMore(items.length > PAGE_SIZE);
        })
        .catch(() => setAllVideos([]))
        .finally(() => setLoading(false));
    } else {
      // Fetch from your backend
      setIsYouTube(false);
      api.get("/videos")
        .then(({ data }) => {
          setAllVideos(data);
          setDisplayed(data.slice(0, PAGE_SIZE));
          setHasMore(data.length > PAGE_SIZE);
        })
        .catch(() => { setAllVideos([]); setDisplayed([]); })
        .finally(() => setLoading(false));
    }
  }, [category, ytQuery]);

  useEffect(() => {
    if (page === 1) return;
    setLoadingMore(true);
    const next = allVideos.slice(0, page * PAGE_SIZE);
    setDisplayed(next);
    setHasMore(next.length < allVideos.length);
    setLoadingMore(false);
  }, [page, allVideos]);

  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
      setPage(p => p + 1);
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, { root: null, rootMargin: "200px", threshold: 0 });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", flexDirection: "column", gap: "12px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading videos...</p>
    </div>
  );

  if (displayed.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <MdVideoLibrary size={56} color="#e53e3e" style={{ marginBottom: "12px" }} />
      <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>No videos yet</p>
      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>Be the first to upload a video!</p>
    </div>
  );

  const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d"];

  return (
    <div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "18px 14px" }}>
        {displayed.map((video, i) => {
          const color = avatarColors[i % avatarColors.length];
          const initial = (video.user?.username || video.title || "F")[0].toUpperCase();
          const href = video.isYouTube ? video.videoUrl : `/video/${video._id}`;
          const isExternal = video.isYouTube;

          return (
            <a key={video._id} href={href} target={isExternal ? "_blank" : "_self"} rel={isExternal ? "noopener noreferrer" : undefined}
              style={{ textDecoration: "none", color: "var(--text)", display: "block" }}>
              <div>
                <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#e53e3e22", border: "1px solid var(--border)" }}>
                  <img src={video.thumbnailUrl} alt={video.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      const ytMatch = video.videoUrl?.match(/embed\/([a-zA-Z0-9_-]+)/);
                      if (ytMatch) e.target.src = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                      else e.target.style.display = "none";
                    }}
                  />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", opacity: 0, transition: "opacity 0.2s" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                  >
                    <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <FaPlay size={18} color="#fff" style={{ marginLeft: "3px" }} />
                    </div>
                  </div>
                  {video.isYouTube && (
                    <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "#e53e3e", borderRadius: "4px", padding: "2px 6px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <FaYoutube size={10} color="#fff" />
                      <span style={{ fontSize: "10px", color: "#fff", fontWeight: "700" }}>YouTube</span>
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "flex-start" }}>
                  <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: color, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "13px", fontWeight: "700" }}>
                    {initial}
                  </div>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35", color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {video.title}
                    </p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{video.user?.username || "FluxTube User"}</p>
                    {video.views !== "" && <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{video.views} views</p>}
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div ref={sentinelRef} style={{ height: "1px" }} />

      {loadingMore && (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
          <div style={{ width: "28px", height: "28px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      {!hasMore && displayed.length > 0 && (
        <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--text-muted)", fontSize: "13px" }}>
          <div style={{ width: "40px", height: "1px", background: "var(--border)", display: "inline-block", marginRight: "12px", verticalAlign: "middle" }} />
          You've seen all videos
          <div style={{ width: "40px", height: "1px", background: "var(--border)", display: "inline-block", marginLeft: "12px", verticalAlign: "middle" }} />
        </div>
      )}
    </div>
  );
}