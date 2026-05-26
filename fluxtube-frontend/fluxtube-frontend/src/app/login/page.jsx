"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    try {
      const user = localStorage.getItem("fluxtubeUser");
      if (user) router.replace("/");
    } catch {}
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", form);
      localStorage.setItem("fluxtubeUser", JSON.stringify(data));
      router.replace("/");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--search-border)", fontSize: "14px",
    background: "var(--bg)", color: "var(--text)", outline: "none",
  };

  return (
    <div style={{
      minHeight: "100vh", background: "var(--bg)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "40px 36px", width: "100%", maxWidth: "420px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
          <div style={{ background: "#e53e3e", color: "#fff", width: "36px", height: "28px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
            </svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)" }}>FluxTube</span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>Welcome back</h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>Log in to your FluxTube account</p>

        {error && (
          <div style={{
            background: "#fff1f1", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "12px 14px",
            marginBottom: "18px", fontSize: "13px", color: "#b91c1c",
          }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>Email</label>
            <input type="email" placeholder="you@example.com" required value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>Password</label>
            <input type="password" placeholder="••••••••" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })} style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "11px", borderRadius: "10px", border: "none",
            background: loading ? "#f87171" : "#e53e3e", color: "#fff",
            fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "6px",
          }}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "22px" }}>
          Don't have an account?{" "}
          <Link href="/signup" style={{ color: "#e53e3e", fontWeight: "600", textDecoration: "none" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
}