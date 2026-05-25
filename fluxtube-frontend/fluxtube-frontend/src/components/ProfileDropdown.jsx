"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * ProfileDropdown Component
 * Shows a user avatar button that opens a dropdown menu on hover/tap.
 * - Desktop: hover to open, positioned absolutely below avatar
 * - Mobile: tap to toggle, dropdown stretches full width from right edge
 */
export default function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false); // Track viewport size
  const dropdownRef = useRef(null);
  const router = useRouter();

  // ── Detect mobile viewport ──
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // ── Close dropdown when clicking/tapping outside ──
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
    router.push("/login");
  };

  // ── Get first letter of user's name for avatar placeholder ──
  const initial = user?.name?.charAt(0)?.toUpperCase() || "N";

  // ── On desktop: open on hover. On mobile: toggle on tap only ──
  const hoverProps = isMobile ? {} : {
    onMouseEnter: () => setIsOpen(true),
    onMouseLeave: () => setIsOpen(false),
  };

  return (
    <div
      className="pd-wrapper"
      ref={dropdownRef}
      {...hoverProps}
    >
      {/* ── Avatar button — toggles dropdown on mobile tap ── */}
      <button
        className="pd-icon-btn"
        aria-label="Profile menu"
        aria-expanded={isOpen}
        onClick={() => isMobile && setIsOpen(p => !p)}
      >
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="pd-avatar-img" />
        ) : (
          <div className="pd-avatar-placeholder">{initial}</div>
        )}
      </button>

      {/* ── Dropdown menu ── */}
      <div className={`pd-menu ${isOpen ? "pd-menu--open" : ""}`}>

        {/* Arrow pointer — hidden on mobile (full width panel) */}
        <div className="pd-arrow" />

        {/* User info header */}
        <div className="pd-header">
          <div className="pd-header-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="pd-header-placeholder">{initial}</div>
            )}
          </div>
          <div className="pd-user-info">
            <p className="pd-username">{user?.name || "Guest"}</p>
            <p className="pd-email">{user?.email || ""}</p>
          </div>
        </div>

        <div className="pd-divider" />

        {/* ── Menu items ── */}
        <Link href="/profile" className="pd-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Your Profile
        </Link>

        <Link href="/upload" className="pd-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          Upload Video
        </Link>

        <Link href="/subscriptions" className="pd-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Subscriptions
        </Link>

        <Link href="/activity-dashboard" className="pd-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Activity Dashboard
        </Link>

        <div className="pd-divider" />

        {/* Logout button */}
        <button className="pd-item pd-item--logout" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>

      <style jsx>{`
        /* ── Wrapper ── */
        .pd-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        /* ── Avatar button ── */
        .pd-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          /* Larger tap target on mobile */
          min-width: 36px;
          min-height: 36px;
        }

        .pd-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .pd-avatar-placeholder {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #cc0000;
          color: white;
          font-weight: 700;
          font-size: 15px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #fff;
          box-shadow: 0 0 0 2px #cc0000;
        }

        /* ── Dropdown panel ── */
        .pd-menu {
          position: fixed;
          top: 56px; /* Sits just below the navbar */
          right: 0;
          /* Desktop: fixed 240px. Mobile: full viewport width */
          width: min(240px, 100vw);
          background: #fff;
          border-radius: 0 0 14px 14px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.08);
          border: 1px solid #e8e8e8;
          padding: 8px 0;
          z-index: 1000;

          /* Hidden by default — animated in when .pd-menu--open is added */
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        /* Open state */
        .pd-menu--open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        /* ── Arrow pointer — hidden on mobile (full-width panel) ── */
        .pd-arrow {
          position: absolute;
          top: -6px;
          right: 10px;
          width: 12px;
          height: 12px;
          background: #fff;
          border-left: 1px solid #e8e8e8;
          border-top: 1px solid #e8e8e8;
          transform: rotate(45deg);
          border-radius: 2px 0 0 0;
        }

        /* ── Header section ── */
        .pd-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 10px;
        }

        .pd-header-avatar {
          flex-shrink: 0;
        }

        .pd-header-avatar img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .pd-header-placeholder {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #cc0000;
          color: white;
          font-weight: 700;
          font-size: 17px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pd-user-info {
          overflow: hidden;
          min-width: 0;
        }

        .pd-username {
          font-weight: 600;
          font-size: 14px;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .pd-email {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 2px 0 0;
        }

        /* ── Divider ── */
        .pd-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 6px 0;
        }

        /* ── Menu items ── */
        .pd-item {
          display: flex;
          align-items: center;
          gap: 12px;
          /* Taller padding on mobile for easier tapping */
          padding: 11px 16px;
          font-size: 14px;
          color: #222;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.12s ease, color 0.12s ease;
        }

        .pd-item:hover,
        .pd-item:focus-visible {
          background: #f5f5f5;
          color: #cc0000;
          outline: none;
        }

        /* Active state for touch — gives visual feedback on tap */
        .pd-item:active {
          background: #fce8e8;
          color: #cc0000;
        }

        .pd-item svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          stroke: currentColor;
        }

        /* Logout item has red text by default */
        .pd-item--logout {
          color: #cc0000;
          font-weight: 500;
        }

        .pd-item--logout:hover {
          background: #fff0f0;
          color: #aa0000;
        }

        /* ── Mobile overrides ── */
        @media (max-width: 639px) {
          /* Full-width panel on mobile */
          .pd-menu {
            width: 100vw;
            border-radius: 0 0 16px 16px;
            /* Slightly larger text and padding for easier tapping */
          }

          /* Hide the arrow pointer — doesn't make sense on full-width panel */
          .pd-arrow {
            display: none;
          }

          /* Bigger tap targets on mobile */
          .pd-item {
            padding: 14px 20px;
            font-size: 15px;
          }

          .pd-header {
            padding: 16px 20px 12px;
          }

          .pd-username {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
}