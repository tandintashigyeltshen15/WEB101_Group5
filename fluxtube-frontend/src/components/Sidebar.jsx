"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaHome, FaCompass, FaPlayCircle, FaUpload,
  FaTrophy, FaSignInAlt, FaUserPlus, FaBookOpen,
  FaChartLine, FaChevronLeft, FaChevronRight,
  FaSignOutAlt, FaUserCircle,
} from "react-icons/fa";

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("fluxtubeUser");
    setLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fluxtubeUser");
    setLoggedIn(false);
    router.push("/login");
  };

  const mainItems = [
    { href: "/",                    label: "Home",               icon: FaHome },
    { href: "/explore",             label: "Explore",            icon: FaCompass },
    { href: "/subscriptions",       label: "Subscription",       icon: FaPlayCircle },
    { href: "/upload",              label: "Upload",             icon: FaUpload },
    { href: "/learnify",            label: "Learnify",           icon: FaBookOpen },
    { href: "/activity-dashboard",  label: "Activity Dashboard", icon: FaChartLine },
    { href: "/leaderboard",         label: "Leaderboard",        icon: FaTrophy },
  ];

  const itemStyle = (extraStyle = {}) => ({
    display: "flex",
    alignItems: "center",
    gap: collapsed ? "0" : "14px",
    justifyContent: collapsed ? "center" : "flex-start",
    padding: collapsed ? "12px 0" : "11px 14px",
    borderRadius: "10px",
    cursor: "pointer",
    textDecoration: "none",
    color: "var(--sidebar-text)",
    whiteSpace: "nowrap",
    margin: "1px 6px",
    transition: "background 0.15s",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    background: "transparent",
    width: collapsed ? "calc(100% - 8px)" : "calc(100% - 12px)",
    ...extraStyle,
  });

  return (
    <aside style={{
      width: collapsed ? "64px" : "220px",
      background: "var(--sidebar-bg)",
      flexShrink: 0,
      display: "flex",
      flexDirection: "column",
      height: "calc(100vh - 56px)",
      position: "sticky",
      top: "56px",
      overflowY: "auto",
      overflowX: "hidden",
      transition: "width 0.25s ease, background 0.3s ease",
    }}>
      <div style={{ paddingTop: "8px", flex: 1 }}>
        {mainItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={itemStyle()}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}
          >
            <Icon size={20} style={{ flexShrink: 0 }} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div style={{ margin: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.2)" }} />

        {loggedIn ? (
          <>
            <Link href="/profile" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <FaUserCircle size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Profile</span>}
            </Link>
            <button onClick={handleLogout} style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <FaSignOutAlt size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Log Out</span>}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <FaSignInAlt size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Log In</span>}
            </Link>
            <Link href="/signup" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}
            >
              <FaUserPlus size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span>Sign Up</span>}
            </Link>
          </>
        )}
      </div>

      <button
        onClick={() => setCollapsed(p => !p)}
        style={itemStyle({ marginBottom: "8px", marginTop: "4px" })}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
      >
        {collapsed
          ? <FaChevronRight size={20} style={{ flexShrink: 0 }} />
          : <><FaChevronLeft size={20} style={{ flexShrink: 0 }} /><span>Collapse</span></>
        }
      </button>
    </aside>
  );
}