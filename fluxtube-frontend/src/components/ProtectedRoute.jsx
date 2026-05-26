"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * ProtectedRoute Component
 * Checks if a user is logged in via localStorage.
 * - If not checked yet: shows a loading spinner
 * - If not logged in: shows a centered login prompt card
 * - If logged in: renders children normally
 * Responsive: card padding and button layout adjust for mobile screens
 */
export default function ProtectedRoute({ children, pageName = "this page" }) {
  const [checked, setChecked]   = useState(false);  // Whether auth check is complete
  const [loggedIn, setLoggedIn] = useState(false);  // Whether user is authenticated

  // ── Check localStorage for saved user on mount ──
  useEffect(() => {
    try {
      const user = localStorage.getItem("fluxtubeUser");
      setLoggedIn(!!user);
    } catch {
      setLoggedIn(false);
    }
    setChecked(true);
  }, []);

  // ── Loading state: auth check in progress ──
  if (!checked) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {/* Spinner + responsive styles injected here so no extra CSS file needed */}
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
        `}</style>
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: "12px",
        }}>
          <div style={{
            width: "32px", height: "32px",
            border: "3px solid var(--border)",
            borderTop: "3px solid #e53e3e",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // ── Not logged in: show login prompt ──
  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--bg)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        // Horizontal padding prevents card from touching screen edges on mobile
        padding: "20px 16px",
      }}>
        <style>{`
          /* Responsive adjustments for the login prompt card */

          /* Stack buttons vertically on very small screens */
          @media (max-width: 360px) {
            .pr-btn-row {
              flex-direction: column !important;
            }
            .pr-btn-row a {
              width: 100%;
              text-align: center;
              box-sizing: border-box;
            }
          }

          /* Reduce card padding on mobile */
          @media (max-width: 480px) {
            .pr-card {
              padding: 36px 20px !important;
            }
            .pr-title {
              font-size: 18px !important;
            }
            .pr-desc {
              font-size: 13px !important;
            }
          }
        `}</style>

        <div
          className="pr-card"
          style={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "16px",
            // Desktop: generous padding. Reduced on mobile via CSS above.
            padding: "48px 36px",
            width: "100%",
            maxWidth: "420px",
            textAlign: "center",
          }}
        >
          {/* Lock / warning icon */}
          <div style={{
            width: "64px", height: "64px",
            borderRadius: "50%",
            background: "#fff1f1",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#e53e3e">
              <path d="M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm1 17h-2v-2h2v2zm0-4h-2V6h2v8z"/>
            </svg>
          </div>

          {/* Title */}
          <h2
            className="pr-title"
            style={{
              fontSize: "20px",
              fontWeight: "700",
              color: "var(--text)",
              marginBottom: "10px",
              // Prevent long page names from breaking layout
              wordBreak: "break-word",
            }}
          >
            Please log in first
          </h2>

          {/* Description */}
          <p
            className="pr-desc"
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              marginBottom: "28px",
              lineHeight: "1.6",
            }}
          >
            You need to be logged in to access{" "}
            <strong style={{ color: "var(--text)" }}>{pageName}</strong>.
          </p>

          {/* Action buttons — side by side on tablet+, stacked on tiny screens */}
          <div
            className="pr-btn-row"
            style={{
              display: "flex",
              gap: "10px",
              justifyContent: "center",
              flexWrap: "wrap", // Wrap naturally before the @media kicks in
            }}
          >
            <Link
              href="/login"
              style={{
                padding: "11px 28px",
                borderRadius: "10px",
                background: "#e53e3e",
                color: "#fff",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                // Grow to fill available space on very narrow screens
                flex: "1 1 auto",
                textAlign: "center",
                maxWidth: "160px",
              }}
            >
              Log In
            </Link>
            <Link
              href="/signup"
              style={{
                padding: "11px 28px",
                borderRadius: "10px",
                border: "1px solid var(--border)",
                background: "var(--chip-bg)",
                color: "var(--text)",
                textDecoration: "none",
                fontWeight: "600",
                fontSize: "14px",
                flex: "1 1 auto",
                textAlign: "center",
                maxWidth: "160px",
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Logged in: render the protected page content ──
  return children;
}