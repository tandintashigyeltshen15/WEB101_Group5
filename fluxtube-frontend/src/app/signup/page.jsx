"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function SignupPage() {
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("fluxtubeUser");
    if (user) router.push("/");
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", {
        username: form.username,
        email: form.email,
        password: form.password,
      });
      localStorage.setItem("fluxtubeUser", JSON.stringify(data));
      router.push("/");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <div style={{
        background: "var(--card)",
        border: "1px solid var(--border)",
        borderRadius: "16px",
        padding: "40px 36px",
        width: "100%",
        maxWidth: "420px",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", marginBottom: "28px" }}>
          <div style={{
            background: "#e53e3e", color: "#fff",
            width: "36px", height: "28px", borderRadius: "8px",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
              <path d="M21.58 7.19c-.23-.86-.91-1.54-1.77-1.77C18.25 5 12 5 12 5s-6.25 0-7.81.42c-.86.23-1.54.91-1.77 1.77C2 8.75 2 12 2 12s0 3.25.42 4.81c.23.86.91 1.54 1.77 1.77C5.75 19 12 19 12 19s6.25 0 7.81-.42c.86-.23 1.54-.91 1.77-1.77C22 15.25 22 12 22 12s0-3.25-.42-4.81zM10 15V9l5.2 3-5.2 3z"/>
            </svg>
          </div>
          <span style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)" }}>FluxTube</span>
        </div>

        <h1 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)", marginBottom: "6px", textAlign: "center" }}>
          Create your account
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-muted)", textAlign: "center", marginBottom: "28px" }}>
          Join FluxTube and start watching
        </p>

        {error && (
          <div style={{
            background: "#fff1f1", border: "1px solid #fca5a5",
            borderRadius: "10px", padding: "12px 14px",
            marginBottom: "18px", fontSize: "13px", color: "#b91c1c",
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>
              Username
            </label>
            <input
              type="text"
              placeholder="yourname"
              required
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "10px", border: "1px solid var(--search-border)",
                fontSize: "14px", background: "var(--bg)", color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "10px", border: "1px solid var(--search-border)",
                fontSize: "14px", background: "var(--bg)", color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Min. 6 characters"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "10px", border: "1px solid var(--search-border)",
                fontSize: "14px", background: "var(--bg)", color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: "13px", fontWeight: "500", color: "var(--text)", display: "block", marginBottom: "6px" }}>
              Confirm Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              required
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              style={{
                width: "100%", padding: "10px 14px",
                borderRadius: "10px", border: "1px solid var(--search-border)",
                fontSize: "14px", background: "var(--bg)", color: "var(--text)",
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%", padding: "11px",
              borderRadius: "10px", border: "none",
              background: loading ? "#f87171" : "#e53e3e",
              color: "#fff", fontSize: "15px", fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "6px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "13px", color: "var(--text-muted)", marginTop: "22px" }}>
          Already have an account?{" "}
          <Link href="/login" style={{ color: "#e53e3e", fontWeight: "600", textDecoration: "none" }}>
            Log In
          </Link>
        </p>
      </div>
    </div>
  );
}