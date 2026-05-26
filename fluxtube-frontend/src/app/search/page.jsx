"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import { FaPlay, FaYoutube } from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";

const YT_API_KEY = "AIzaSyCXu-L2Bf_niq3cWm26d_pJeR3YKZo-FVM";

function SearchResults() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError("");
    fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(q)}&type=video&maxResults=20&key=${YT_API_KEY}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError("API error: " + data.error.message); return; }
        setResults(data.items || []);
      })
      .catch(() => setError("Failed to fetch results."))
      .finally(() => setLoading(false));
  }, [q]);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "24px 28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <FaYoutube size={22} color="#e53e3e" />
            <h2 style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>
              Results for "<span style={{ color: "#e53e3e" }}>{q}</span>"
            </h2>
          </div>

          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: "60px", flexDirection: "column", alignItems: "center", gap: "12px" }}>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <div style={{ width: "36px", height: "36px", border: "3px solid var(--border)", borderTop: "3px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              <p style={{ color: "var(--text-muted)", fontSize: "13px" }}>Searching YouTube...</p>
            </div>
          )}

          {error && (
            <div style={{ padding: "20px", borderRadius: "12px", background: "#fff1f1", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px" }}>
              {error}<br />
              <span style={{ fontSize: "12px" }}>Make sure you've added a valid YouTube Data API v3 key in search/page.jsx</span>
            </div>
          )}

          {!loading && !error && results.length === 0 && q && (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <MdVideoLibrary size={56} color="#e53e3e" style={{ marginBottom: "12px" }} />
              <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>No results found</p>
              <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Try a different search term</p>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: "18px 14px" }}>
            {results.map((item) => {
              const { videoId } = item.id;
              const { title, channelTitle, thumbnails, publishedAt } = item.snippet;
              const thumb = thumbnails?.high?.url || thumbnails?.medium?.url;
              const ytUrl = `https://www.youtube.com/watch?v=${videoId}`;
              const date = new Date(publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

              return (
                <a key={videoId} href={ytUrl} target="_blank" rel="noopener noreferrer"
                  style={{ textDecoration: "none", color: "var(--text)", display: "block" }}>
                  <div>
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#111", border: "1px solid var(--border)" }}>
                      <img src={thumb} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", opacity: 0, transition: "opacity 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.opacity = "1"}
                        onMouseLeave={e => e.currentTarget.style.opacity = "0"}
                      >
                        <div style={{ width: "48px", height: "48px", borderRadius: "50%", background: "rgba(0,0,0,0.7)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FaPlay size={18} color="#fff" style={{ marginLeft: "3px" }} />
                        </div>
                      </div>
                      {/* YouTube badge */}
                      <div style={{ position: "absolute", bottom: "6px", right: "6px", background: "#e53e3e", borderRadius: "4px", padding: "2px 6px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FaYoutube size={10} color="#fff" />
                        <span style={{ fontSize: "10px", color: "#fff", fontWeight: "700" }}>YouTube</span>
                      </div>
                    </div>
                    <div style={{ marginTop: "10px" }}>
                      <p style={{ fontSize: "13px", fontWeight: "700", lineHeight: "1.35", color: "var(--text)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {title}
                      </p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "3px" }}>{channelTitle}</p>
                      <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{date}</p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}