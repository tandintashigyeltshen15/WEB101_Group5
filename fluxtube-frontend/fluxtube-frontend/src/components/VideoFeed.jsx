"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { MdVideoLibrary } from "react-icons/md";
import { FaPlay, FaYoutube } from "react-icons/fa";
import api from "../lib/api";

const PAGE_SIZE = 9; // Number of videos to show per page
const YT_API_KEY = "AIzaSyCXu-L2Bf_niq3cWm26d_pJeR3YKZo-FVM"; // YouTube Data API key

/**
 * VideoFeed Component
 * Displays a paginated grid of videos.
 * - If ytQuery is provided: fetches YouTube videos via the YouTube API
 * - If ytQuery is null ("All" chip): shows a prompt to pick a category
 * - Responsive: 1 column on mobile, 2 on tablet, 3 on desktop
 * User-uploaded videos are intentionally NOT shown here (Home page only)
 */
export default function VideoFeed({ category, ytQuery }) {
  const [allVideos, setAllVideos]     = useState([]); // Full list of fetched videos
  const [displayed, setDisplayed]     = useState([]); // Subset currently shown
  const [page, setPage]               = useState(1);  // Current pagination page
  const [loading, setLoading]         = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore]         = useState(true); // Whether more videos exist

  // Refs for infinite scroll sentinel and IntersectionObserver
  const observerRef = useRef(null);
  const sentinelRef = useRef(null);

  // ── Fetch videos whenever category or ytQuery changes ──
  useEffect(() => {
    // Reset all state on every new fetch
    setLoading(true);
    setPage(1);
    setAllVideos([]);
    setDisplayed([]);
    setHasMore(true);

    if (ytQuery) {
      // ── YouTube mode: fetch from YouTube Data API ──
      fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(ytQuery)}&type=video&maxResults=20&key=${YT_API_KEY}`
      )
        .then(r => r.json())
        .then(data => {
          // Map YouTube API response to our internal video shape
          const items = (data.items || []).map(item => ({
            _id: item.id.videoId,
            title: item.snippet.title,
            thumbnailUrl: item.snippet.thumbnails?.high?.url,
            videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
            user: { username: item.snippet.channelTitle },
            views: "", // Not available from search endpoint
            isYouTube: true,
          }));
          setAllVideos(items);
          setDisplayed(items.slice(0, PAGE_SIZE));
          setHasMore(items.length > PAGE_SIZE);
        })
        .catch(() => {
          setAllVideos([]);
          setDisplayed([]);
        })
        .finally(() => setLoading(false));

    } else {
      // ── "All" chip: do NOT fetch user uploads here (Home page only) ──
      setAllVideos([]);
      setDisplayed([]);
      setHasMore(false);
      setLoading(false);
    }
  }, [category, ytQuery]);

  // ── Load more videos when page increments (infinite scroll) ──
  useEffect(() => {
    if (page === 1) return; // Skip on initial load
    setLoadingMore(true);
    const next = allVideos.slice(0, page * PAGE_SIZE);
    setDisplayed(next);
    setHasMore(next.length < allVideos.length);
    setLoadingMore(false);
  }, [page, allVideos]);

  // ── IntersectionObserver: trigger next page when sentinel enters viewport ──
  const handleObserver = useCallback((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
      setPage(p => p + 1);
    }
  }, [hasMore, loadingMore, loading]);

  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();
    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "200px", // Load before user hits the bottom
      threshold: 0,
    });
    if (sentinelRef.current) observerRef.current.observe(sentinelRef.current);
    return () => observerRef.current?.disconnect();
  }, [handleObserver]);

  // ── Avatar color palette (cycles by index) ──
  const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d"];

  // ── Loading spinner ──
  if (loading) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px", flexDirection: "column", gap: "12px" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Loading videos...</p>
    </div>
  );

  // ── Empty state: shown when "All" is selected or no results found ──
  if (displayed.length === 0) return (
    <div style={{ textAlign: "center", padding: "60px 20px" }}>
      <MdVideoLibrary size={56} color="#e53e3e" style={{ marginBottom: "12px" }} />
      <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>
        {ytQuery ? "No videos found" : "Pick a category to explore!"}
      </p>
      <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
        {ytQuery
          ? "Try a different category."
          : "Select Music, Gaming, News or any chip above to discover videos."}
      </p>
    </div>
  );

  // ── Video grid ──
  return (
    <div>
      {/* Responsive grid + spin animation */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Responsive grid breakpoints ──
           Mobile  (<480px) : 1 column
           Tablet  (<768px) : 2 columns
           Desktop (768px+) : 3 columns  */
        .vf-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 18px 14px;
        }
        @media (max-width: 767px) {
          .vf-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 10px; }
        }
        @media (max-width: 479px) {
          .vf-grid { grid-template-columns: 1fr; gap: 16px; }
        }

        /* Hover effect on video cards */
        .vf-card { transition: transform 0.18s ease; }
        .vf-card:hover { transform: translateY(-2px); }

        /* Play overlay — show on hover (desktop), always visible on touch devices */
        .vf-overlay { opacity: 0; transition: opacity 0.2s; }
        .vf-card:hover .vf-overlay { opacity: 1; }
        @media (hover: none) {
          /* Touch devices: always show play button */
          .vf-overlay { opacity: 1 !important; }
        }
      `}</style>

      <div className="vf-grid">
        {displayed.map((video, i) => {
          const color   = avatarColors[i % avatarColors.length];
          const initial = (video.user?.username || video.title || "F")[0].toUpperCase();

          // YouTube videos open in new tab; internal videos go to /video/:id
          const href       = video.isYouTube ? video.videoUrl : `/video/${video._id}`;
          const isExternal = video.isYouTube;

          return (
            
            <a key={video._id} href={href} target={isExternal ? "_blank" : "_self"} rel="noopener noreferrer" style={{ textDecoration: "none", color: "var(--text)", display: "block" }} className="vf-card">
              {/* ── Thumbnail container ── */}
              <div style={{
                position: "relative", width: "100%", aspectRatio: "16/9",
                borderRadius: "10px", overflow: "hidden",
                background: "#e53e3e22", border: "1px solid var(--border)",
              }}>
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={(e) => {
                    // Fallback: derive thumbnail from YouTube video URL if available
                    const ytMatch = video.videoUrl?.match(/(?:embed\/|v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
                    if (ytMatch) e.target.src = `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg`;
                    else e.target.style.display = "none";
                  }}
                />

                {/* Play button overlay — hidden on desktop until hover, visible on touch */}
                <div className="vf-overlay" style={{
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

                {/* YouTube badge — only for YouTube videos */}
                {video.isYouTube && (
                  <div style={{
                    position: "absolute", bottom: "6px", right: "6px",
                    background: "#e53e3e", borderRadius: "4px",
                    padding: "2px 6px",
                    display: "flex", alignItems: "center", gap: "4px",
                  }}>
                    <FaYoutube size={10} color="#fff" />
                    <span style={{ fontSize: "10px", color: "#fff", fontWeight: "700" }}>YouTube</span>
                  </div>
                )}
              </div>

              {/* ── Video info row ── */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px", alignItems: "flex-start" }}>
                {/* Channel avatar — first letter of username */}
                <div style={{
                  width: "34px", height: "34px", borderRadius: "50%",
                  background: color, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontSize: "13px", fontWeight: "700",
                }}>
                  {initial}
                </div>
                <div style={{ minWidth: 0 }}>
                  {/* Title — clamped to 2 lines */}
                  <p style={{
                    fontSize: "13px", fontWeight: "700", lineHeight: "1.35",
                    color: "var(--text)", margin: 0,
                    display: "-webkit-box", WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical", overflow: "hidden",
                  }}>
                    {video.title}
                  </p>
                  {/* Channel name */}
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px", marginBottom: 0 }}>
                    {video.user?.username || "FluxTube User"}
                  </p>
                  {/* View count — hidden for YouTube (not in search API response) */}
                  {video.views !== "" && (
                    <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                      {video.views} views
                    </p>
                  )}
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* ── Infinite scroll sentinel — watched by IntersectionObserver ── */}
      <div ref={sentinelRef} style={{ height: "1px" }} />

      {/* ── Spinner for loading subsequent pages ── */}
      {loadingMore && (
        <div style={{ display: "flex", justifyContent: "center", padding: "24px" }}>
          <div style={{ width: "28px", height: "28px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      )}

      {/* ── End of results indicator ── */}
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