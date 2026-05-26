"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../lib/api";

const MEDAL        = ["🥇","🥈","🥉"];
const MEDAL_COLORS = ["#f59e0b","#94a3b8","#cd7c3f"];
const avatarColors = ["#e53e3e","#7c3aed","#d97706","#0f6e56","#1d4ed8","#be185d","#0891b2","#65a30d"];

function formatNum(n) {
  if (!n) return "0";
  if (n >= 1_000_000) return (n/1_000_000).toFixed(1)+"M";
  if (n >= 1_000)     return (n/1_000).toFixed(1)+"K";
  return n.toString();
}

export default function LeaderboardPage() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState("subscribers");

  useEffect(() => {
    api.get("/videos").then(({ data }) => setVideos(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const channelMap = {};
  videos.forEach(v => {
    const uid  = v.user?._id || v.user || "unknown";
    const name = v.user?.username || "FluxTube User";
    if (!channelMap[uid]) channelMap[uid] = { uid, name, videos:0, views:0, likes:0, subscribers:0 };
    channelMap[uid].videos++;
    channelMap[uid].views += v.views || 0;
    channelMap[uid].likes += v.likes || 0;
    channelMap[uid].subscribers = Math.round(channelMap[uid].views * 0.05);
  });
  const channels      = Object.values(channelMap);
  const bySubscribers = [...channels].sort((a,b) => b.subscribers - a.subscribers);
  const byViews       = [...videos].sort((a,b)   => (b.views||0) - (a.views||0));
  const byLikes       = [...videos].sort((a,b)   => (b.likes||0) - (a.likes||0));

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"14px" }}>
      <div style={{ width:"36px", height:"36px", border:"3px solid var(--border)", borderTop:"3px solid #e53e3e", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const Row = ({ item, i, type }) => {
    const isTop3     = i < 3;
    const isChannel  = type === "subscribers";
    const thumb      = !isChannel && (item.thumbnailUrl || (item.videoUrl?.match(/embed\/([a-zA-Z0-9_-]+)/) ? `https://i.ytimg.com/vi/${item.videoUrl.match(/embed\/([a-zA-Z0-9_-]+)/)[1]}/hqdefault.jpg` : null));
    const value      = type === "subscribers" ? formatNum(item.subscribers) : type === "views" ? formatNum(item.views||0) : formatNum(item.likes||0);
    const label      = type === "subscribers" ? "subscribers" : type === "views" ? "views" : "likes";
    const maxVal     = type === "subscribers" ? (bySubscribers[0]?.subscribers||1) : type === "views" ? (byViews[0]?.views||1) : (byLikes[0]?.likes||1);
    const rawVal     = type === "subscribers" ? item.subscribers : type === "views" ? (item.views||0) : (item.likes||0);
    const barColor   = isTop3 ? MEDAL_COLORS[i] : type === "views" ? "#3b82f6" : "#e53e3e";

    const inner = (
      <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px 16px", borderRadius:"14px",
        background: isTop3 ? `${MEDAL_COLORS[i]}12` : "var(--chip-bg)",
        border:`1px solid ${isTop3 ? MEDAL_COLORS[i]+"40" : "var(--border)"}`,
        cursor: isChannel ? "default" : "pointer", transition:"transform 0.15s" }}
        onMouseEnter={e => e.currentTarget.style.transform="translateX(4px)"}
        onMouseLeave={e => e.currentTarget.style.transform="translateX(0)"}>
        <div style={{ width:"32px", textAlign:"center", flexShrink:0 }}>
          {isTop3 ? <span style={{ fontSize:"22px" }}>{MEDAL[i]}</span>
                  : <span style={{ fontSize:"14px", fontWeight:"700", color:"var(--text-muted)" }}>{i+1}</span>}
        </div>
        {isChannel ? (
          <div style={{ width:"42px", height:"42px", borderRadius:"50%", flexShrink:0, background:avatarColors[i%avatarColors.length], display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:"700", fontSize:"16px" }}>
            {item.name[0].toUpperCase()}
          </div>
        ) : thumb ? (
          <img src={thumb} alt={item.title} style={{ width:"80px", height:"50px", borderRadius:"8px", objectFit:"cover", flexShrink:0 }} onError={e=>e.target.style.display="none"} />
        ) : null}
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ margin:"0 0 3px", fontWeight:"700", fontSize:"13px", color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {isChannel ? item.name : item.title}
          </p>
          <p style={{ margin:0, fontSize:"12px", color:"var(--text-muted)" }}>
            {isChannel ? `${item.videos} video${item.videos!==1?"s":""} · ${formatNum(item.views)} views` : (item.user?.username||"FluxTube User")}
          </p>
        </div>
        <div style={{ textAlign:"right", flexShrink:0 }}>
          <div style={{ fontSize:"16px", fontWeight:"800", color:"var(--text)" }}>{value}</div>
          <div style={{ fontSize:"11px", color:"var(--text-muted)" }}>{label}</div>
        </div>
        <div style={{ width:"80px", flexShrink:0 }}>
          <div style={{ height:"6px", background:"var(--border)", borderRadius:"999px", overflow:"hidden" }}>
            <div style={{ height:"100%", borderRadius:"999px", background:barColor, width:`${Math.round((rawVal/maxVal)*100)}%`, transition:"width 0.6s" }} />
          </div>
        </div>
      </div>
    );

    return isChannel ? <div key={item.uid}>{inner}</div>
      : <Link key={item._id} href={`/video/${item._id}`} style={{ textDecoration:"none", color:"inherit" }}>{inner}</Link>;
  };

  const currentList = tab === "subscribers" ? bySubscribers : tab === "views" ? byViews : byLikes;

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ display:"flex" }}>
        <Sidebar />
        <main style={{ flex:1, padding:"24px", overflowX:"hidden", maxWidth:"900px" }}>

          <div style={{ marginBottom:"24px" }}>
            <h1 style={{ fontSize:"26px", fontWeight:"800", color:"var(--text)", margin:0 }}>🏆 Leaderboard</h1>
            <p style={{ fontSize:"14px", color:"var(--text-muted)", margin:"4px 0 0" }}>Top performers across the platform</p>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px", marginBottom:"28px" }}>
            {[
              { label:"Total Channels", value:channels.length,                                                      icon:"📺" },
              { label:"Total Videos",   value:videos.length,                                                        icon:"🎬" },
              { label:"Total Views",    value:formatNum(videos.reduce((s,v)=>s+(v.views||0),0)),                    icon:"👁️" },
              { label:"Total Likes",    value:formatNum(videos.reduce((s,v)=>s+(v.likes||0),0)),                    icon:"❤️" },
            ].map(s => (
              <div key={s.label} style={{ padding:"16px 18px", borderRadius:"14px", background:"var(--chip-bg)", border:"1px solid var(--border)", textAlign:"center" }}>
                <div style={{ fontSize:"24px", marginBottom:"6px" }}>{s.icon}</div>
                <div style={{ fontSize:"22px", fontWeight:"800", color:"var(--text)" }}>{s.value}</div>
                <div style={{ fontSize:"12px", color:"var(--text-muted)", marginTop:"2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"flex", gap:"8px", marginBottom:"20px", borderBottom:"1px solid var(--border)" }}>
            {[
              { id:"subscribers", label:"Subscribers", icon:"👥" },
              { id:"views",       label:"Most Viewed",  icon:"👁️" },
              { id:"likes",       label:"Most Liked",   icon:"❤️" },
            ].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                style={{ padding:"10px 20px", border:"none", background:"none", cursor:"pointer", fontSize:"14px", fontWeight:"700",
                  color: tab===t.id ? "#e53e3e" : "var(--text-muted)",
                  borderBottom: tab===t.id ? "2px solid #e53e3e" : "2px solid transparent",
                  transition:"all 0.15s" }}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>

          <p style={{ fontSize:"13px", color:"var(--text-muted)", marginBottom:"16px" }}>
            {tab==="subscribers" && "Ranked by estimated subscriber count"}
            {tab==="views"       && "Videos ranked by total view count"}
            {tab==="likes"       && "Videos ranked by total likes received"}
          </p>

          {currentList.length === 0
            ? <p style={{ color:"var(--text-muted)", fontSize:"14px" }}>No data found.</p>
            : <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {currentList.map((item, i) => <Row key={item._id||item.uid} item={item} i={i} type={tab} />)}
              </div>
          }
        </main>
      </div>
    </div>
  );
}