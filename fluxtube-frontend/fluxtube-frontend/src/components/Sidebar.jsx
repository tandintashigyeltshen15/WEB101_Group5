"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  FaHome, FaCompass, FaPlayCircle, FaUpload,
  FaTrophy, FaSignInAlt, FaUserPlus, FaBookOpen,
  FaChartLine, FaChevronLeft, FaChevronRight,
  FaSignOutAlt, FaUserCircle, FaTimes, FaBars,
} from "react-icons/fa";

export default function Sidebar() {
  const [collapsed, setCollapsed]   = useState(false); // Desktop collapsed state
  const [mobileOpen, setMobileOpen] = useState(false); // Mobile drawer open state
  const [loggedIn, setLoggedIn]     = useState(false);
  const [isMobile, setIsMobile]     = useState(false); // Whether viewport is mobile
  const router   = useRouter();
  const pathname = usePathname();

  // ── Check screen size and update isMobile ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Close mobile drawer on route change ──
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // ── Read login state from localStorage ──
  useEffect(() => {
    const user = localStorage.getItem("fluxtubeUser");
    setLoggedIn(!!user);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fluxtubeUser");
    setLoggedIn(false);
    router.push("/login");
  };

  // ── Navigation items ──
  const mainItems = [
    { href: "/",                   label: "Home",               icon: FaHome },
    { href: "/explore",            label: "Explore",            icon: FaCompass },
    { href: "/subscriptions",      label: "Subscription",       icon: FaPlayCircle },
    { href: "/upload",             label: "Upload",             icon: FaUpload },
    { href: "/learnify",           label: "Learnify",           icon: FaBookOpen },
    { href: "/activity-dashboard", label: "Activity Dashboard", icon: FaChartLine },
    { href: "/leaderboard",        label: "Leaderboard",        icon: FaTrophy },
  ];

  // ── Shared link/button style — adjusts for collapsed/mobile ──
  const itemStyle = (extra = {}) => ({
    display: "flex",
    alignItems: "center",
    gap: (collapsed && !isMobile) ? "0" : "14px",
    justifyContent: (collapsed && !isMobile) ? "center" : "flex-start",
    padding: (collapsed && !isMobile) ? "12px 0" : "11px 14px",
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
    width: (collapsed && !isMobile) ? "calc(100% - 8px)" : "calc(100% - 12px)",
    ...extra,
  });

  // ── Sidebar content (shared between desktop and mobile drawer) ──
  const SidebarContent = () => (
    <div style={{ paddingTop: "8px", flex: 1, display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ flex: 1 }}>
        {mainItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} style={itemStyle()}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <Icon size={20} style={{ flexShrink: 0 }} />
            {/* Hide label when desktop sidebar is collapsed */}
            {!(collapsed && !isMobile) && <span>{label}</span>}
          </Link>
        ))}

        {/* Divider */}
        <div style={{ margin: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.2)" }} />

        {/* Auth-aware items */}
        {loggedIn ? (
          <>
            <Link href="/profile" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <FaUserCircle size={20} style={{ flexShrink: 0 }} />
              {!(collapsed && !isMobile) && <span>Profile</span>}
            </Link>
            <button onClick={handleLogout} style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <FaSignOutAlt size={20} style={{ flexShrink: 0 }} />
              {!(collapsed && !isMobile) && <span>Log Out</span>}
            </button>
          </>
        ) : (
          <>
            <Link href="/login" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <FaSignInAlt size={20} style={{ flexShrink: 0 }} />
              {!(collapsed && !isMobile) && <span>Log In</span>}
            </Link>
            <Link href="/signup" style={itemStyle()}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              <FaUserPlus size={20} style={{ flexShrink: 0 }} />
              {!(collapsed && !isMobile) && <span>Sign Up</span>}
            </Link>
          </>
        )}
      </div>

      {/* ── Collapse toggle — desktop only ── */}
      {!isMobile && (
        <button onClick={() => setCollapsed(p => !p)}
          style={itemStyle({ marginBottom: "8px", marginTop: "4px" })}
          onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.15)"}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
          {collapsed
            ? <FaChevronRight size={20} style={{ flexShrink: 0 }} />
            : <><FaChevronLeft size={20} style={{ flexShrink: 0 }} /><span>Collapse</span></>
          }
        </button>
      )}
    </div>
  );

  // ── Mobile: hamburger button fixed to bottom-left + slide-in drawer ──
  if (isMobile) {
    return (
      <>
        {/* Hamburger button — always visible on mobile */}
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: "fixed", bottom: "20px", left: "16px",
            zIndex: 150,
            width: "48px", height: "48px", borderRadius: "50%",
            background: "#e53e3e", border: "none",
            boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}>
          <FaBars size={20} color="#fff" />
        </button>

        {/* Backdrop — closes drawer when tapped */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            style={{
              position: "fixed", inset: 0, zIndex: 200,
              background: "rgba(0,0,0,0.5)",
            }}
          />
        )}

        {/* Slide-in drawer */}
        <aside style={{
          position: "fixed", top: 0, left: 0, bottom: 0,
          width: "240px",
          background: "var(--sidebar-bg)",
          zIndex: 201,
          display: "flex", flexDirection: "column",
          overflowY: "auto", overflowX: "hidden",
          paddingTop: "56px", // Below navbar
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease",
          boxShadow: mobileOpen ? "4px 0 20px rgba(0,0,0,0.3)" : "none",
        }}>
          {/* Close button inside drawer */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              position: "absolute", top: "60px", right: "12px",
              background: "rgba(255,255,255,0.15)", border: "none",
              borderRadius: "50%", width: "30px", height: "30px",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
            }}>
            <FaTimes size={14} color="#fff" />
          </button>
          <SidebarContent />
        </aside>
      </>
    );
  }

  // ── Desktop: sticky sidebar with collapse support ──
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
      <SidebarContent />
    </aside>
  );
}