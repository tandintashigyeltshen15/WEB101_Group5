"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";

const THEME_COLORS = ["#e53e3e", "#7c3aed", "#2563eb", "#16a34a", "#ea580c", "#db2777"];

function ProfileContent() {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [themeColor, setThemeColor] = useState("#e53e3e");
  const [form, setForm] = useState({ username: "", bio: "" });
  const router = useRouter();

  useEffect(() => {
    const stored = localStorage.getItem("fluxtubeUser");
    if (stored) {
      const parsed = JSON.parse(stored);
      setUser(parsed);
      setForm({ username: parsed.username || "", bio: parsed.bio || "" });
      setThemeColor(parsed.themeColor || "#e53e3e");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("fluxtubeUser");
    router.push("/login");
  };

  const handleSave = () => {
    const updated = { ...user, username: form.username, bio: form.bio, themeColor };
    localStorage.setItem("fluxtubeUser", JSON.stringify(updated));
    setUser(updated);
    setEditing(false);
  };

  if (!user) return null;

  const initial = (user.username || "F")[0].toUpperCase();
  const handle = "@" + (user.username?.toLowerCase().replace(/\s/g, "") || "user");

  const cardStyle = {
    background: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "14px",
    padding: "24px",
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    borderRadius: "10px", border: "1px solid var(--search-border)",
    fontSize: "14px", background: "var(--bg)",
    color: "var(--text)", outline: "none",
  };

  const staticFieldStyle = {
    padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--border)", marginTop: "6px",
    fontSize: "14px", color: "var(--text)",
    background: "var(--bg-secondary)",
  };

  const labelStyle = {
    fontSize: "12px", color: "var(--text-muted)",
    fontWeight: "500", display: "block", marginBottom: "6px",
  };

  return (
    <div style={{ padding: "28px 32px", maxWidth: "1000px", color: "var(--text)" }}>

      {/* Edit Profile Modal */}
      {editing && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 100,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "20px",
        }}>
          <div style={{
            background: "var(--card)", borderRadius: "16px",
            width: "100%", maxWidth: "760px",
            maxHeight: "90vh", overflowY: "auto",
            padding: "32px", position: "relative",
          }}>
            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "28px" }}>
              <div>
                <h2 style={{ fontSize: "20px", fontWeight: "700", color: "var(--text)" }}>Edit Profile</h2>
                <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "4px" }}>Update your profile information</p>
              </div>
              <button onClick={() => setEditing(false)} style={{
                width: "32px", height: "32px", borderRadius: "50%",
                background: "var(--chip-bg)", border: "1px solid var(--border)",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--text)", fontSize: "16px", fontWeight: "700",
              }}>✕</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr", gap: "32px" }}>
              {/* Left: Avatar */}
              <div>
                <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)", marginBottom: "16px" }}>Profile Picture</p>
                <div style={{ position: "relative", width: "120px" }}>
                  <div style={{
                    width: "120px", height: "120px", borderRadius: "50%",
                    background: themeColor, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    fontSize: "48px", fontWeight: "700", color: "#fff",
                    border: "3px solid var(--border)",
                  }}>
                    {initial}
                  </div>
                  <div style={{
                    position: "absolute", bottom: "4px", right: "4px",
                    width: "30px", height: "30px", borderRadius: "50%",
                    background: "var(--card)", border: "2px solid var(--border)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                  }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text)">
                      <path d="M12 15.2A3.2 3.2 0 0 1 8.8 12 3.2 3.2 0 0 1 12 8.8 3.2 3.2 0 0 1 15.2 12 3.2 3.2 0 0 1 12 15.2M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/>
                    </svg>
                  </div>
                </div>
                <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "10px", lineHeight: "1.5" }}>
                  JPG, PNG or WEBP.<br />Max size 5MB.
                </p>
                <button style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  marginTop: "12px", padding: "8px 14px",
                  borderRadius: "8px", border: "1px solid var(--border)",
                  background: "var(--chip-bg)", color: "var(--text)",
                  fontSize: "13px", fontWeight: "500", cursor: "pointer",
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--text)">
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/>
                  </svg>
                  Change Photo
                </button>
              </div>

              {/* Right: Fields */}
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    style={inputStyle}
                    placeholder="Your full name"
                  />
                </div>

                <div>
                  <label style={labelStyle}>Username</label>
                  <input
                    value={user.username?.toLowerCase().replace(/\s/g, "")}
                    readOnly
                    style={{ ...inputStyle, color: "var(--text-muted)" }}
                  />
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "6px" }}>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                      Your profile link: fluxtube.com/{handle}
                    </p>
                    <button
                      onClick={() => navigator.clipboard.writeText(`fluxtube.com/${handle}`)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}
                      title="Copy link"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    value={user.email}
                    readOnly
                    style={{ ...inputStyle, color: "var(--text-muted)" }}
                  />
                </div>

                <div>
                  <label style={labelStyle}>Bio</label>
                  <div style={{ position: "relative" }}>
                    <textarea
                      value={form.bio}
                      onChange={e => {
                        if (e.target.value.length <= 160)
                          setForm({ ...form, bio: e.target.value });
                      }}
                      placeholder="Tell us about yourself..."
                      rows={4}
                      style={{ ...inputStyle, resize: "vertical", paddingBottom: "24px" }}
                    />
                    <p style={{
                      position: "absolute", bottom: "8px", right: "12px",
                      fontSize: "11px", color: "var(--text-muted)",
                    }}>
                      {form.bio.length}/160
                    </p>
                  </div>
                </div>

                {/* Theme Color */}
                <div>
                  <label style={labelStyle}>Theme Color</label>
                  <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                    {THEME_COLORS.map(color => (
                      <button
                        key={color}
                        onClick={() => setThemeColor(color)}
                        style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          background: color, border: themeColor === color
                            ? `3px solid var(--text)` : "3px solid transparent",
                          cursor: "pointer", display: "flex",
                          alignItems: "center", justifyContent: "center",
                          transition: "transform 0.15s",
                        }}
                      >
                        {themeColor === color && (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                            <path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Tip */}
            <div style={{
              marginTop: "24px", padding: "12px 16px",
              background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.2)",
              borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px",
            }}>
              <span style={{ fontSize: "18px" }}>✨</span>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Tip: Your changes are visible to everyone.</p>
            </div>

            {/* Buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
              <button onClick={() => setEditing(false)} style={{
                padding: "10px 24px", borderRadius: "10px",
                border: "1px solid var(--border)", background: "var(--chip-bg)",
                color: "var(--text)", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              }}>Cancel</button>
              <button onClick={handleSave} style={{
                padding: "10px 24px", borderRadius: "10px",
                border: "none", background: "#e53e3e",
                color: "#fff", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              }}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "22px", fontWeight: "700" }}>My Profile</h1>
        <p style={{ fontSize: "13px", color: "var(--text-muted)", marginTop: "2px" }}>
          Manage your account and preferences
        </p>
      </div>

      {/* Banner */}
      <div style={{
        ...cardStyle,
        background: "linear-gradient(135deg, #1a0a0a 0%, #8b0000 60%, #e53e3e 100%)",
        border: "none", marginBottom: "20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: "20px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: themeColor, border: "3px solid rgba(255,255,255,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "32px", fontWeight: "700", color: "#fff",
            }}>
              {initial}
            </div>
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "20px", fontWeight: "700", color: "#fff" }}>{user.username}</h2>
              <span style={{
                background: "rgba(255,200,0,0.2)", color: "#fbbf24",
                border: "1px solid #fbbf24", borderRadius: "999px",
                fontSize: "11px", fontWeight: "600", padding: "2px 10px",
              }}>⭐ Creator</span>
            </div>
            <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", marginTop: "4px" }}>{handle}</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
              📅 Joined {new Date().toLocaleString("default", { month: "long", year: "numeric" })}
            </p>
            <div style={{ display: "flex", gap: "24px", marginTop: "14px" }}>
              {[{ label: "Uploads", value: "0" }, { label: "Subscribers", value: "0" }, { label: "Views", value: "0" }].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: "18px", fontWeight: "700", color: "#fff" }}>{value}</p>
                  <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button onClick={() => setEditing(true)} style={{
          display: "flex", alignItems: "center", gap: "6px",
          padding: "9px 18px", borderRadius: "10px",
          background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)",
          color: "#fff", fontSize: "13px", fontWeight: "600", cursor: "pointer",
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
          Edit Profile
        </button>
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Profile Info */}
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="var(--text-muted)">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
            </svg>
            <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Profile Information</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {[
              { label: "Full Name", value: user.username },
              { label: "Email", value: user.email },
              { label: "Username", value: handle },
            ].map(({ label, value }) => (
              <div key={label}>
                <label style={labelStyle}>{label}</label>
                <div style={staticFieldStyle}>{value}</div>
              </div>
            ))}
            <div>
              <label style={labelStyle}>Bio</label>
              <div style={{ ...staticFieldStyle, minHeight: "60px", color: user.bio ? "var(--text)" : "var(--text-muted)" }}>
                {user.bio || "No bio yet. Click Edit Profile to add one."}
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#e53e3e">
                <path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
              </svg>
              <h3 style={{ fontSize: "15px", fontWeight: "700" }}>Account Settings</h3>
            </div>
            {[
              { icon: "🔑", title: "Change Password", sub: "Update your account password" },
              { icon: "✉️", title: "Email Preferences", sub: "Manage your email notifications" },
              { icon: "🔒", title: "Privacy Settings", sub: "Control your privacy and data" },
            ].map(({ icon, title, sub }) => (
              <div key={title} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "12px 0", borderBottom: "1px solid var(--border)", cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "18px" }}>{icon}</span>
                  <div>
                    <p style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>{title}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-muted)" }}>{sub}</p>
                  </div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--text-muted)">
                  <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </div>
            ))}
          </div>

          <div style={cardStyle}>
            <h3 style={{ fontSize: "15px", fontWeight: "700", marginBottom: "16px" }}>Session</h3>
            <button onClick={handleLogout} style={{
              width: "100%", padding: "11px", borderRadius: "10px",
              border: "1px solid #e53e3e", background: "transparent",
              color: "#e53e3e", fontSize: "14px", fontWeight: "600", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#e53e3e">
                <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Premium banner */}
      <div style={{
        marginTop: "20px", ...cardStyle,
        background: "linear-gradient(135deg, #1a0a0a, #7c2d12)",
        border: "none", display: "flex",
        alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <div style={{
            width: "44px", height: "44px", borderRadius: "50%",
            background: "rgba(251,191,36,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px",
          }}>👑</div>
          <div>
            <p style={{ fontSize: "15px", fontWeight: "700", color: "#fff" }}>Upgrade to FluxTube Premium</p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.6)" }}>Unlock exclusive features and support creators</p>
          </div>
        </div>
        <button style={{
          padding: "10px 22px", borderRadius: "10px", border: "none",
          background: "#e53e3e", color: "#fff", fontSize: "14px",
          fontWeight: "600", cursor: "pointer", whiteSpace: "nowrap",
        }}>Upgrade Now →</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <ProtectedRoute pageName="Profile">
      <ProfileContent />
    </ProtectedRoute>
  );
}