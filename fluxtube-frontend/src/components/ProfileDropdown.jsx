"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Replace this with your actual auth context/hook
// import { useAuth } from "@/context/AuthContext";

export default function ProfileDropdown({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) onLogout();
    // e.g. signOut(), clearToken(), etc.
    router.push("/login");
  };

  // Get user initial for avatar
  const initial = user?.name?.charAt(0)?.toUpperCase() || "N";

  return (
    <div
      className="profile-dropdown-wrapper"
      ref={dropdownRef}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Profile Icon Button */}
      <button className="profile-icon-btn" aria-label="Profile menu">
        {user?.avatar ? (
          <img src={user.avatar} alt={user.name} className="profile-avatar-img" />
        ) : (
          <div className="profile-avatar-placeholder">{initial}</div>
        )}
      </button>

      {/* Dropdown Menu */}
      <div className={`profile-dropdown-menu ${isOpen ? "open" : ""}`}>
        {/* User Info Header */}
        <div className="dropdown-header">
          <div className="dropdown-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} />
            ) : (
              <div className="dropdown-avatar-placeholder">{initial}</div>
            )}
          </div>
          <div className="dropdown-user-info">
            <p className="dropdown-username">{user?.name || "Guest"}</p>
            <p className="dropdown-email">{user?.email || ""}</p>
          </div>
        </div>

        <div className="dropdown-divider" />

        {/* Menu Items */}
        <Link href="/profile" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          Your Profile
        </Link>

        <Link href="/upload" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
          Upload Video
        </Link>

        <Link href="/subscriptions" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          Subscriptions
        </Link>

        <Link href="/activity-dashboard" className="dropdown-item" onClick={() => setIsOpen(false)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
          Activity Dashboard
        </Link>

        <div className="dropdown-divider" />

        <button className="dropdown-item logout-item" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>

      <style jsx>{`
        .profile-dropdown-wrapper {
          position: relative;
          display: inline-flex;
          align-items: center;
        }

        /* Profile Icon */
        .profile-icon-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .profile-avatar-img {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          object-fit: cover;
        }

        .profile-avatar-placeholder {
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

        /* Dropdown */
        .profile-dropdown-menu {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          width: 240px;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15), 0 2px 8px rgba(0, 0, 0, 0.08);
          border: 1px solid #e8e8e8;
          padding: 8px 0;
          z-index: 1000;

          /* Animation */
          opacity: 0;
          transform: translateY(-8px) scale(0.97);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
        }

        .profile-dropdown-menu.open {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
        }

        /* Arrow pointer */
        .profile-dropdown-menu::before {
          content: "";
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

        /* Header */
        .dropdown-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px 10px;
        }

        .dropdown-avatar {
          flex-shrink: 0;
        }

        .dropdown-avatar img {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .dropdown-avatar-placeholder {
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

        .dropdown-user-info {
          overflow: hidden;
        }

        .dropdown-username {
          font-weight: 600;
          font-size: 14px;
          color: #111;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 0;
        }

        .dropdown-email {
          font-size: 12px;
          color: #666;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin: 2px 0 0;
        }

        /* Divider */
        .dropdown-divider {
          height: 1px;
          background: #f0f0f0;
          margin: 6px 0;
        }

        /* Items */
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 16px;
          font-size: 14px;
          color: #222;
          text-decoration: none;
          cursor: pointer;
          background: none;
          border: none;
          width: 100%;
          text-align: left;
          transition: background 0.12s ease;
          border-radius: 0;
        }

        .dropdown-item:hover {
          background: #f5f5f5;
          color: #cc0000;
        }

        .dropdown-item svg {
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          stroke: currentColor;
        }

        .logout-item {
          color: #cc0000;
          font-weight: 500;
        }

        .logout-item:hover {
          background: #fff0f0;
          color: #aa0000;
        }
      `}</style>
    </div>
  );
}