"use client";

import { useMemo, useState } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";

const channels = [
  {
    id: 1,
    name: "James Arthur",
    category: "Music",
    subscribers: 1650000,
    tagline: "Official music & behind-the-scenes",
    gradient: ["#3b82f6", "#1d4ed8"],
    subscribed: true,
  },
  {
    id: 2,
    name: "Monica Church",
    category: "Vlog",
    subscribers: 3740000,
    tagline: "Daily vlogs, family moments, and travel",
    gradient: ["#ec489a", "#db2777"],
    subscribed: true,
  },
  {
    id: 3,
    name: "ThreadBanger",
    category: "DIY",
    subscribers: 518000,
    tagline: "Creative builds, tools, and tutorials",
    gradient: ["#f97316", "#ea580c"],
    subscribed: false,
  },
  {
    id: 4,
    name: "VICKYLOGAN",
    category: "Lifestyle",
    subscribers: 653000,
    tagline: "Style, wellness, and everyday inspiration",
    gradient: ["#8b5cf6", "#7c3aed"],
    subscribed: true,
  },
  {
    id: 5,
    name: "Rclbeauty101",
    category: "Beauty",
    subscribers: 14200000,
    tagline: "Beauty routines, reviews, and product picks",
    gradient: ["#f43f5e", "#e11d48"],
    subscribed: false,
  },
  {
    id: 6,
    name: "YolandaBeck",
    category: "Fashion",
    subscribers: 327000,
    tagline: "Fashion drops and styling tips",
    gradient: ["#06b6d4", "#0891b2"],
    subscribed: false,
  },
  {
    id: 7,
    name: "jeffreestar",
    category: "Beauty",
    subscribers: 15600000,
    tagline: "Makeup tutorials and beauty commentary",
    gradient: ["#d946ef", "#c026d3"],
    subscribed: false,
  },
  {
    id: 8,
    name: "Sharee Love",
    category: "Lifestyle",
    subscribers: 434000,
    tagline: "Lifestyle storytelling and family moments",
    gradient: ["#84cc16", "#65a30d"],
    subscribed: false,
  },
  {
    id: 9,
    name: "SamanthaSchuerman",
    category: "Beauty",
    subscribers: 428000,
    tagline: "Beauty, skincare, and wellness routines",
    gradient: ["#14b8a6", "#0f766e"],
    subscribed: false,
  },
  {
    id: 10,
    name: "Beardbrand",
    category: "Grooming",
    subscribers: 2120000,
    tagline: "Grooming advice, styling, and gear",
    gradient: ["#facc15", "#eab308"],
    subscribed: false,
  },
  {
    id: 11,
    name: "ALLURBANCENTRAL",
    category: "Music",
    subscribers: 2890000,
    tagline: "Fresh music videos and live performances",
    gradient: ["#a855f7", "#9333ea"],
    subscribed: false,
  },
  {
    id: 12,
    name: "Clifford Owusu",
    category: "Comedy",
    subscribers: 515000,
    tagline: "Comedy sketches and local highlights",
    gradient: ["#ef4444", "#dc2626"],
    subscribed: false,
  },
  {
    id: 13,
    name: "TheMostPopularGirls",
    category: "Entertainment",
    subscribers: 1100000,
    tagline: "Funny, candid, and lifestyle content",
    gradient: ["#eab308", "#ca8a04"],
    subscribed: false,
  },
  {
    id: 14,
    name: "AllDef",
    category: "Music",
    subscribers: 4620000,
    tagline: "Music culture, interviews, and showcases",
    gradient: ["#3b82f6", "#2563eb"],
    subscribed: false,
  },
];

const filters = ["All", "Music", "Vlog", "DIY", "Lifestyle", "Beauty", "Fashion", "Comedy", "Entertainment", "Grooming"];

const formatSubscribers = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(value >= 10000000 ? 0 : 1)}M subscribers`;
  }
  return `${Math.round(value / 1000)}K subscribers`;
};

export default function SubscriptionsPage() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [subscribedIds, setSubscribedIds] = useState(() =>
    new Set(channels.filter((channel) => channel.subscribed).map((channel) => channel.id)),
  );

  const visibleChannels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return channels.filter((channel) => {
      const matchesFilter = activeFilter === "All" || channel.category === activeFilter;
      const matchesQuery =
        !normalizedQuery ||
        channel.name.toLowerCase().includes(normalizedQuery) ||
        channel.tagline.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, query]);

  const toggleSubscription = (id) => {
    setSubscribedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const subscribedCount = subscribedIds.size;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "24px 24px 48px" }}>
          <div style={{ marginBottom: "24px" }}>
            <p
              style={{
                margin: 0,
                color: "var(--text-muted)",
                fontSize: "14px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Subscriptions
            </p>
            <h1 style={{ margin: "8px 0 4px", fontSize: "28px" }}>Recommended channels</h1>
            <p style={{ margin: 0, color: "var(--text-muted)", maxWidth: "760px" }}>
              Discover creators you may want to follow, refine the feed by category, and manage your subscriptions from one place.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "20px",
              alignItems: "center",
            }}
          >
            <input
              aria-label="Search channels"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search channels or topics"
              style={{
                flex: "1 1 280px",
                minWidth: 0,
                border: "1px solid var(--border)",
                borderRadius: "999px",
                padding: "12px 16px",
                background: "var(--card)",
                color: "var(--text)",
                fontSize: "14px",
              }}
            />
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {filters.map((filter) => {
                const isActive = filter === activeFilter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    style={{
                      borderRadius: "999px",
                      border: isActive ? "1px solid transparent" : "1px solid var(--border)",
                      background: isActive ? "var(--text)" : "var(--chip-bg)",
                      color: isActive ? "var(--bg)" : "var(--chip-text)",
                      padding: "8px 14px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: "16px",
              marginBottom: "20px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "15px", color: "var(--text-muted)" }}>
                {visibleChannels.length} channels match your current filters
              </p>
              <p style={{ margin: "4px 0 0", fontSize: "14px", color: "var(--text-muted)" }}>
                You are currently subscribed to {subscribedCount} creators.
              </p>
            </div>
            <div
              style={{
                padding: "10px 14px",
                borderRadius: "999px",
                background: "var(--chip-bg)",
                color: "var(--text-muted)",
                fontSize: "14px",
              }}
            >
              Showing {activeFilter === "All" ? "all categories" : activeFilter}
            </div>
          </div>

          {visibleChannels.length === 0 ? (
            <div
              style={{
                padding: "36px 20px",
                borderRadius: "20px",
                border: "1px dashed var(--border)",
                textAlign: "center",
                color: "var(--text-muted)",
              }}
            >
              No channels match that search yet. Try a different keyword or category.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "18px",
              }}
            >
              {visibleChannels.map((channel) => {
                const isSubscribed = subscribedIds.has(channel.id);
                return (
                  <article
                    key={channel.id}
                    style={{
                      borderRadius: "20px",
                      overflow: "hidden",
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      boxShadow: "0 18px 30px rgba(15, 23, 42, 0.08)",
                    }}
                  >
                    <div
                      style={{
                        height: "92px",
                        background: `linear-gradient(135deg, ${channel.gradient[0]}, ${channel.gradient[1]})`,
                      }}
                    />
                    <div style={{ padding: "0 16px 18px", textAlign: "center", marginTop: "-34px" }}>
                      <div
                        style={{
                          width: "72px",
                          height: "72px",
                          borderRadius: "999px",
                          margin: "0 auto",
                          border: "4px solid var(--bg)",
                          background: `linear-gradient(135deg, ${channel.gradient[0]}, ${channel.gradient[1]})`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#fff",
                          fontWeight: 800,
                          fontSize: "28px",
                        }}
                      >
                        {channel.name.charAt(0).toUpperCase()}
                      </div>
                      <h2 style={{ margin: "12px 0 6px", fontSize: "18px" }}>{channel.name}</h2>
                      <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "13px" }}>
                        {formatSubscribers(channel.subscribers)}
                      </p>
                      <p
                        style={{
                          margin: "10px 0 16px",
                          color: "var(--text-muted)",
                          minHeight: "42px",
                          fontSize: "14px",
                          lineHeight: 1.5,
                        }}
                      >
                        {channel.tagline}
                      </p>
                      <button
                        type="button"
                        onClick={() => toggleSubscription(channel.id)}
                        style={{
                          width: "100%",
                          borderRadius: "999px",
                          border: "none",
                          padding: "10px 14px",
                          background: isSubscribed ? "var(--chip-bg)" : "#e53e3e",
                          color: isSubscribed ? "var(--text)" : "#fff",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {isSubscribed ? "Subscribed" : "Subscribe"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
