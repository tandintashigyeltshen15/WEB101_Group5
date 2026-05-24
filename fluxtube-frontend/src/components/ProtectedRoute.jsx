"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProtectedRoute({ children, pageName = "this page" }) {
  const [checked, setChecked] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    try {
      const user = localStorage.getItem("fluxtubeUser");
      setLoggedIn(!!user);
    } catch {
      setLoggedIn(false);
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading...</p>
      </div>
    );
  }

  if (!loggedIn) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
      }}>
        <div style={{
          background: "var(--card)", border: "1px solid var(--border)",
          borderRadius: "16px", padding: "48px 36px",
          width: "100%", maxWidth: "420px", textAlign: "center",
        }}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "50%",
            background: "#fff1f1", display: "flex",
            alignItems: "center", justifyContent: "center", margin: "0 auto 20px",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#e53e3e">
              <path d="M12 1C5.93 1 1 5.93 1 12s4.93 11 11 11 11-4.93 11-11S18.07 1 12 1zm1 17h-2v-2h2v2zm0-4h-2V6h2v8z"/>
            </svg>
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "10px" }}>
            Please log in first
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "28px", lineHeight: "1.6" }}>
            You need to be logged in to access <strong style={{ color: "var(--text)" }}>{pageName}</strong>.
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Link href="/login" style={{
              padding: "10px 24px", borderRadius: "10px",
              background: "#e53e3e", color: "#fff",
              textDecoration: "none", fontWeight: "600", fontSize: "14px",
            }}>Log In</Link>
            <Link href="/signup" style={{
              padding: "10px 24px", borderRadius: "10px",
              border: "1px solid var(--border)",
              background: "var(--chip-bg)", color: "var(--text)",
              textDecoration: "none", fontWeight: "600", fontSize: "14px",
            }}>Sign Up</Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
}