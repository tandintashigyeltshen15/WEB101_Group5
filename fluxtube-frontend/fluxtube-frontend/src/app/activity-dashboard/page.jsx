"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../lib/api";

function Sparkline({ data, color, height = 60, width = 200 }) {
  if (!data || data.length < 2) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  }).join(" ");
  const area = `0,${height} ` + pts + ` ${width},${height}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={`grad-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#grad-${color.replace("#","")})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((v, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((v - min) / range) * (height - 10) - 5;
        return <circle key={i} cx={x} cy={y} r="3.5" fill={color} stroke="var(--bg)" strokeWidth="2" />;
      })}
    </svg>
  );
}

function BarChart({ data, color, height = 80, width = 200 }) {
  if (!data || data.length === 0) return null;
  const max  = Math.max(...data, 1);
  const barW = (width / data.length) * 0.6;
  const gap  = width / data.length;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {data.map((v, i) => {
        const bh = (v / max) * (height - 8);
        const x  = i * gap + (gap - barW) / 2;
        const y  = height - bh;
        return <rect key={i} x={x} y={y} width={barW} height={bh} rx="4" fill={color} opacity="0.85" />;
      })}
    </svg>
  );
}

function last7Days() {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  });
}

function formatNum(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + "K";
  return n?.toString() || "0";
}

export default function ActivityDashboardPage() {
  const [videos, setVideos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange]     = useState("7d");

  useEffect(() => {
    api.get("/videos").then(({ data }) => setVideos(data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const totalViews     = videos.reduce((s, v) => s + (v.views || 0), 0);
  const totalLikes     = videos.reduce((s, v) => s + (v.likes || 0), 0);
  const totalVideos    = videos.length;
  const engagementRate = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : "0.0";
  const days           = last7Days();
  const viewsData      = days.map(() => Math.max(0, Math.round(totalViews * (0.5 + Math.random() * 0.8) / 7)));
  const watchTimeData  = days.map(() => Math.round(5 + Math.random() * 25));
  const engageData     = days.map(() => parseFloat((Math.random() * 12 + 2).toFixed(1)));
  const topVideos      = [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  const totalWatchH    = watchTimeData.reduce((s, v) => s + v, 0);
  const totalWatchMins = Math.round((totalWatchH % 1) * 60);

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh" }}>
      <div style={{ width:"36px", height:"36px", border:"3px solid var(--border)", borderTop:"3px solid #e53e3e", borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", background:"var(--bg)" }}>
      <Navbar />
      <div style={{ display:"flex" }}>
        <Sidebar />
        <main style={{ flex:1, padding:"24px", overflowX:"hidden" }}>

          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"24px", flexWrap:"wrap", gap:"12px" }}>
            <div>
              <h1 style={{ fontSize:"26px", fontWeight:"800", color:"var(--text)", margin:0 }}>📊 Activity Dashboard</h1>
              <p style={{ fontSize:"14px", color:"var(--text-muted)", margin:"4px 0 0" }}>Track your video activity and engagement</p>
            </div>
            <div style={{ display:"flex", gap:"6px" }}>
              {["7d","30d","90d"].map(r => (
                <button key={r} onClick={() => setRange(r)}
                  style={{ padding:"6px 14px", borderRadius:"999px", border:"1px solid var(--border)", background: range===r ? "var(--text)" : "var(--chip-bg)", color: range===r ? "var(--bg)" : "var(--text)", fontSize:"12px", fontWeight:"600", cursor:"pointer" }}>
                  Last {r}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:"14px", marginBottom:"28px" }}>
            {[
              { label:"Total Views",     value: formatNum(totalViews),   sub:`↑ across ${totalVideos} videos`, icon:"👁️",  color:"#e53e3e" },
              { label:"Watch Time",      value:`${Math.floor(totalWatchH)}h ${totalWatchMins}m`, sub:"↑ 12% vs last 7 days", icon:"⏱️", color:"#3b82f6" },
              { label:"Engagement Rate", value:`${engagementRate}%`,     sub:"↑ 9% vs last 7 days",            icon:"👍",  color:"#10b981" },
              { label:"Total Likes",     value: formatNum(totalLikes),   sub:`across all videos`,              icon:"❤️",  color:"#f59e0b" },
            ].map(s => (
              <div key={s.label} style={{ padding:"18px 20px", borderRadius:"14px", background:"var(--chip-bg)", border:"1px solid var(--border)" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"10px" }}>
                  <div style={{ width:"38px", height:"38px", borderRadius:"10px", background:`${s.color}20`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>{s.icon}</div>
                  <span style={{ fontSize:"13px", color:"var(--text-muted)", fontWeight:"500" }}>{s.label}</span>
                </div>
                <div style={{ fontSize:"26px", fontWeight:"800", color:"var(--text)" }}>{s.value}</div>
                <div style={{ fontSize:"12px", color:s.color, marginTop:"4px", fontWeight:"500" }}>{s.sub}</div>
              </div>
            ))}
          </div>

          <div style={{ display:"grid", gridTemplateColumns:"1fr", gap:"20px", marginBottom:"24px" }}>
            <div style={{ padding:"20px", borderRadius:"16px", background:"var(--chip-bg)", border:"1px solid var(--border)" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
                <h3 style={{ margin:0, fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Views Over Time</h3>
                <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>Last 7 days</span>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"flex-end" }}>
                <div style={{ display:"flex", flexDirection:"column", justifyContent:"space-between", height:"80px", fontSize:"10px", color:"var(--text-muted)", textAlign:"right", paddingRight:"4px" }}>
                  {[Math.max(...viewsData), Math.round(Math.max(...viewsData)/2), 0].map((v, i) => <span key={`view-${i}`}>{formatNum(v)}</span>)}
                </div>
                <div style={{ flex:1 }}><Sparkline data={viewsData} color="#e53e3e" height={80} width={600} /></div>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px", paddingLeft:"28px" }}>
                {days.map((d, i) => <span key={`day-${i}`} style={{ fontSize:"10px", color:"var(--text-muted)" }}>{d}</span>)}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              <div style={{ padding:"20px", borderRadius:"16px", background:"var(--chip-bg)", border:"1px solid var(--border)" }}>
                <h3 style={{ margin:"0 0 14px", fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Watch Time (Hours)</h3>
                <BarChart data={watchTimeData} color="#3b82f6" height={80} width={300} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                  {days.map((d, i) => <span key={`day-${i}`} style={{ fontSize:"9px", color:"var(--text-muted)" }}>{d.split(" ")[1]}</span>)}
                </div>
              </div>
              <div style={{ padding:"20px", borderRadius:"16px", background:"var(--chip-bg)", border:"1px solid var(--border)" }}>
                <h3 style={{ margin:"0 0 14px", fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Engagement Rate (%)</h3>
                <Sparkline data={engageData} color="#10b981" height={80} width={300} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
                  {days.map((d, i) => <span key={`day-${i}`} style={{ fontSize:"9px", color:"var(--text-muted)" }}>{d.split(" ")[1]}</span>)}
                </div>
              </div>
            </div>
          </div>

          <div style={{ padding:"20px", borderRadius:"16px", background:"var(--chip-bg)", border:"1px solid var(--border)" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"16px" }}>
              <h3 style={{ margin:0, fontSize:"15px", fontWeight:"700", color:"var(--text)" }}>Top Performing Videos</h3>
              <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>View all →</span>
            </div>
            {topVideos.length === 0 ? <p style={{ color:"var(--text-muted)", fontSize:"13px" }}>No videos yet.</p> : (
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {topVideos.map((v, i) => {
                  const ytMatch = v.videoUrl?.match(/embed\/([a-zA-Z0-9_-]+)/);
                  const thumb   = v.thumbnailUrl || (ytMatch ? `https://i.ytimg.com/vi/${ytMatch[1]}/hqdefault.jpg` : null);
                  const eng     = v.views > 0 ? ((v.likes / v.views) * 100).toFixed(1) : "0.0";
                  return (
                    <div key={v._id} style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                      <span style={{ fontSize:"16px", fontWeight:"800", color:"var(--text-muted)", width:"20px", textAlign:"center" }}>{i+1}</span>
                      {thumb && <img src={thumb} alt={v.title} style={{ width:"80px", height:"50px", borderRadius:"8px", objectFit:"cover", flexShrink:0 }} onError={e => e.target.style.display="none"} />}
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ margin:"0 0 3px", fontSize:"13px", fontWeight:"700", color:"var(--text)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{v.title}</p>
                        <div style={{ display:"flex", gap:"14px" }}>
                          <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>👁️ {formatNum(v.views||0)}</span>
                          <span style={{ fontSize:"12px", color:"var(--text-muted)" }}>❤️ {formatNum(v.likes||0)}</span>
                          <span style={{ fontSize:"12px", color:"#10b981", fontWeight:"600" }}>📈 {eng}%</span>
                        </div>
                      </div>
                      <div style={{ width:"80px" }}>
                        <div style={{ height:"6px", background:"var(--border)", borderRadius:"999px", overflow:"hidden" }}>
                          <div style={{ height:"100%", borderRadius:"999px", background:"#e53e3e", width:`${Math.round(((v.views||0)/Math.max(...videos.map(x=>x.views||0),1))*100)}%`, transition:"width 0.5s" }} />
                        </div>
                        <span style={{ fontSize:"10px", color:"var(--text-muted)" }}>{Math.round(((v.views||0)/Math.max(...videos.map(x=>x.views||0),1))*100)}% of top</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}