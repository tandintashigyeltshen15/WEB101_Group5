"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { FaMicrophone, FaSearch, FaBell, FaTimes } from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const [search, setSearch]           = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [user, setUser]               = useState(null);
  const [listening, setListening]     = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false); // Mobile search bar toggle
  const dropdownRef   = useRef(null);
  const hoverTimeout  = useRef(null);
  const recognitionRef = useRef(null);
  const router = useRouter();

  // ── Load logged-in user from localStorage on mount ──
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fluxtubeUser");
      if (stored) setUser(JSON.parse(stored));
    } catch {}
  }, []);

  // ── Close dropdown when clicking outside ──
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // ── Hover handlers for dropdown (desktop) ──
  const handleMouseEnter = () => { clearTimeout(hoverTimeout.current); setDropdownOpen(true); };
  const handleMouseLeave = () => { hoverTimeout.current = setTimeout(() => setDropdownOpen(false), 120); };

  // ── Navigate to search results page ──
  const handleSearch = () => {
    const q = search.trim();
    if (!q) return;
    setShowMobileSearch(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  // ── Voice search using Web Speech API ──
  const handleVoiceSearch = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice search not supported. Try Chrome."); return; }
    if (listening) { recognitionRef.current?.stop(); setListening(false); return; }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.start();
    setListening(true);

    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setSearch(transcript);
      setListening(false);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };
    rec.onerror = (e) => {
      setListening(false);
      if (e.error === "not-allowed") alert("Microphone access denied.");
    };
    rec.onend = () => setListening(false);
  };

  // ── Logout: clear storage and redirect to login ──
  const handleLogout = () => {
    setDropdownOpen(false);
    localStorage.removeItem("fluxtubeUser");
    setUser(null);
    router.replace("/login");
  };

  // ── User display info ──
  const userName    = user?.name || user?.username || "Guest";
  const userHandle  = user?.handle || ("@" + userName.toLowerCase().replace(/\s+/g, "_"));
  const userInitial = userName.charAt(0).toUpperCase();
  const colors      = ["#8B5CF6","#0EA5E9","#10B981","#F59E0B","#EF4444","#EC4899"];
  const avatarColor = colors[userName.charCodeAt(0) % colors.length];

  // ── Dropdown menu items ──
  const menuItems = [
    { href: "/profile",            label: "Your Channel",           icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> },
    { href: "/activity-dashboard", label: "Activity Dashboard",     icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
    { href: "/subscriptions",      label: "Purchases & Memberships",icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg> },
    { href: "/settings",           label: "Settings",               icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
    { href: "/help",               label: "Help",                   icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> },
    { href: "/feedback",           label: "Send Feedback",          icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> },
  ];

  return (
    <>
      {/* ── Responsive style rules injected globally ── */}
      <style>{`
        @media (max-width: 640px) {
          .navbar-search-desktop { display: none !important; }
          .navbar-search-icon    { display: flex !important; }
          .navbar-logo img       { height: 120px !important; margin-left: -28px !important; }
        }
        @media (min-width: 641px) {
          .navbar-search-icon    { display: none !important; }
          .mobile-search-overlay { display: none !important; }
        }
      `}</style>

      <header style={{
        position: "fixed", top: 0, left: 0, right: 0,
        height: "56px",
        background: "var(--nav-bg)",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 12px",
        zIndex: 100,
        transition: "background 0.3s ease",
      }}>

        {/* ── Logo ── */}
        <Link href="/" className="navbar-logo" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <img src="/logo.png" alt="FluxTube" style={{ height: "176px", objectFit: "contain", marginLeft: "-42px" }} />
        </Link>

        {/* ── Search bar — hidden on mobile, shown on tablet/desktop ── */}
        <div className="navbar-search-desktop" style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1, maxWidth: "480px", margin: "0 16px" }}>
          <div style={{
            display: "flex", alignItems: "center",
            border: "1px solid var(--search-border)",
            borderRadius: "999px", overflow: "hidden", flex: 1,
            background: "var(--bg)",
          }}>
            <input
              type="text"
              placeholder="Search FluxTube..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              style={{ border: "none", outline: "none", padding: "7px 14px", fontSize: "14px", flex: 1, background: "transparent", color: "var(--text)" }}
            />
            <button onClick={handleSearch} style={{ width: "52px", height: "34px", background: "var(--chip-bg)", border: "none", borderLeft: "1px solid var(--search-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaSearch size={14} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          {/* Voice search button */}
          <button onClick={handleVoiceSearch} title={listening ? "Listening... click to stop" : "Search by voice"}
            style={{ width: "34px", height: "34px", borderRadius: "50%", background: listening ? "#e53e3e" : "var(--chip-bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "background 0.2s" }}>
            <FaMicrophone size={14} style={{ color: listening ? "#fff" : "var(--text)" }} />
          </button>
        </div>

        {/* ── Right side icons ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>

          {/* Search icon — mobile only, toggles the search overlay */}
          <button className="navbar-search-icon"
            onClick={() => setShowMobileSearch(true)}
            style={{ width: "34px", height: "34px", borderRadius: "50%", background: "var(--chip-bg)", border: "none", cursor: "pointer", alignItems: "center", justifyContent: "center" }}>
            <FaSearch size={15} style={{ color: "var(--text)" }} />
          </button>

          <ThemeToggle />

          {/* Bell icon */}
          <button style={{ width: "34px", height: "34px", borderRadius: "50%", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <FaBell size={20} style={{ color: "var(--text)" }} />
          </button>

          {/* ── Profile avatar + dropdown ── */}
          <div ref={dropdownRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
            style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>

            {/* Avatar button */}
            <button onClick={() => setDropdownOpen(p => !p)}
              style={{
                width: "34px", height: "34px", borderRadius: "50%",
                background: user ? avatarColor : "var(--chip-bg)",
                border: "2px solid #fff",
                boxShadow: user ? `0 0 0 2px ${avatarColor}` : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer", color: "#fff", fontWeight: "700", fontSize: "15px", flexShrink: 0,
              }}>
              {user ? userInitial : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text)" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              )}
            </button>

            {/* ── Dropdown panel ── */}
            <div onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}
              style={{
                position: "fixed",
                top: "56px",
                // On small screens: stretch full width. On large: fixed 265px anchored right.
                right: 0,
                width: "min(265px, 100vw)",
                background: "#fff",
                borderRadius: "0 0 14px 14px",
                boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
                border: "1px solid #ececec",
                zIndex: 1000, overflow: "hidden",
                opacity: dropdownOpen ? 1 : 0,
                transform: dropdownOpen ? "translateY(0)" : "translateY(-8px)",
                pointerEvents: dropdownOpen ? "all" : "none",
                transition: "opacity 0.18s ease, transform 0.18s ease",
              }}>

              {user ? (
                <>
                  {/* User info header */}
                  <div style={{ display: "flex", alignItems: "center", gap: "13px", padding: "16px 16px 14px" }}>
                    <div style={{ width: "46px", height: "46px", borderRadius: "50%", background: avatarColor, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: "700", fontSize: "20px" }}>
                      {userInitial}
                    </div>
                    <div style={{ overflow: "hidden", minWidth: 0 }}>
                      <p style={{ margin: 0, fontWeight: "600", fontSize: "15px", color: "#111", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{userName}</p>
                      <p style={{ margin: "2px 0 5px", fontSize: "12px", color: "#777" }}>{userHandle}</p>
                      <Link href="/profile" onClick={() => setDropdownOpen(false)} style={{ fontSize: "13px", color: "#065fd4", textDecoration: "none", fontWeight: "500" }}>View your channel</Link>
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "#f0f0f0" }} />

                  {/* Menu links */}
                  {menuItems.map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setDropdownOpen(false)}
                      style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", fontSize: "14px", color: "#222", textDecoration: "none", transition: "background 0.1s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ color: "#555", display: "flex", flexShrink: 0 }}>{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  <div style={{ height: "1px", background: "#f0f0f0" }} />

                  {/* Logout button */}
                  <button onClick={handleLogout}
                    style={{ display: "flex", alignItems: "center", gap: "14px", padding: "11px 16px", fontSize: "14px", color: "#cc0000", fontWeight: "500", background: "none", border: "none", width: "100%", textAlign: "left", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.background = "#fff5f5"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#cc0000" strokeWidth="2" style={{ flexShrink: 0 }}>
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Log Out
                  </button>
                </>
              ) : (
                // Not logged in — show login/signup buttons
                <div style={{ padding: "16px" }}>
                  <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#444", textAlign: "center" }}>Sign in to access your account</p>
                  <Link href="/login" onClick={() => setDropdownOpen(false)} style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", background: "#e53e3e", color: "#fff", textDecoration: "none", fontWeight: "600", fontSize: "14px", marginBottom: "8px" }}>Log In</Link>
                  <Link href="/signup" onClick={() => setDropdownOpen(false)} style={{ display: "block", textAlign: "center", padding: "10px", borderRadius: "10px", border: "1px solid #e53e3e", color: "#e53e3e", textDecoration: "none", fontWeight: "600", fontSize: "14px" }}>Sign Up</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile search overlay — full screen search bar on small screens ── */}
      {showMobileSearch && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          background: "var(--nav-bg)",
          display: "flex", alignItems: "center",
          padding: "0 12px", gap: "10px",
        }}>
          <div style={{ display: "flex", flex: 1, alignItems: "center", border: "1px solid var(--search-border)", borderRadius: "999px", overflow: "hidden", background: "var(--bg)" }}>
            <input
              autoFocus
              type="text"
              placeholder="Search FluxTube..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSearch(); }}
              style={{ border: "none", outline: "none", padding: "10px 14px", fontSize: "15px", flex: 1, background: "transparent", color: "var(--text)" }}
            />
            <button onClick={handleSearch} style={{ width: "52px", height: "40px", background: "var(--chip-bg)", border: "none", borderLeft: "1px solid var(--search-border)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FaSearch size={15} style={{ color: "var(--text-muted)" }} />
            </button>
          </div>
          {/* Close the mobile search overlay */}
          <button onClick={() => { setShowMobileSearch(false); setSearch(""); }}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--chip-bg)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FaTimes size={16} style={{ color: "var(--text)" }} />
          </button>
        </div>
      )}
    </>
  );
}