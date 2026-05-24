"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../../components/ProtectedRoute";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../lib/api";
import {
  FaUpload, FaLink, FaGlobe, FaLock, FaPlay,
  FaCheckCircle, FaRocket, FaTimes, FaImage,
} from "react-icons/fa";
import { MdVideoLibrary } from "react-icons/md";

function UploadContent() {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const thumbInputRef = useRef(null);

  const [method, setMethod] = useState("file");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideoId, setUploadedVideoId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [customThumb, setCustomThumb] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    tags: "",
    thumbnailUrl: "",
    videoUrl: "",
    visibility: "public",
  });

  useEffect(() => {
    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [selectedFile]);

  const extractYtId = (url) => {
    const match = url.match(/(?:youtu\.be\/|[?&]v=)([a-zA-Z0-9_-]{11})/);
    return match ? match[1] : null;
  };

  const ytId = extractYtId(form.videoUrl);

  const handleFileSelect = (file) => {
    if (!file) return;
    setSelectedFile(file);
    if (!form.title) setForm(f => ({ ...f, title: file.name.replace(/\.[^/.]+$/, "") }));
  };

  const handlePublish = async () => {
    setError("");
    if (!form.title.trim()) { setError("Title is required"); return; }
    if (method === "file" && !selectedFile) { setError("Please select a video file"); return; }
    if (method === "link" && !form.videoUrl.trim()) { setError("Please enter a video link"); return; }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const storedUser = JSON.parse(localStorage.getItem("fluxtubeUser"));

      if (!storedUser) {
        setError("You must be logged in to upload.");
        setSubmitting(false);
        return;
      }

      const headers = { Authorization: `Bearer ${storedUser.token}` };
      let data;

      if (method === "file") {
        const formData = new FormData();
        formData.append("video", selectedFile);
        formData.append("title", form.title);
        formData.append("description", form.description);
        formData.append("tags", form.tags);
        formData.append("thumbnailUrl", form.thumbnailUrl || "");
        formData.append("visibility", form.visibility);

        const response = await api.post("/videos/upload-file", formData, {
          headers: { ...headers, "Content-Type": "multipart/form-data" },
          onUploadProgress: (e) => {
            setUploadProgress(Math.round((e.loaded * 100) / e.total));
          },
        });
        data = response.data;
        if (!data || !data._id) {
          setError("Upload failed: server did not return a valid video.");
          setSubmitting(false);
          return;
        }
      } else {
        let videoUrl = form.videoUrl;
        if (ytId) videoUrl = `https://www.youtube.com/embed/${ytId}`;
        const thumbnailUrl = form.thumbnailUrl || (ytId ? `https://i.ytimg.com/vi/${ytId}/hqdefault.jpg` : "");

        const response = await api.post("/videos", {
          title: form.title,
          description: form.description,
          thumbnailUrl,
          videoUrl,
          visibility: form.visibility,
        }, { headers });
        data = response.data;
        if (!data || !data._id) {
          setError("Upload failed: server did not return a valid video.");
          setSubmitting(false);
          return;
        }
      }

      setUploadedVideoId(data._id);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Upload failed. Make sure your backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetAll = () => {
    setSelectedFile(null); setPreviewUrl(null); setCustomThumb(null);
    setUploadProgress(0); setUploadedVideoId(null);
    setError(""); setSuccess(false); setMethod("file");
    setForm({ title: "", description: "", tags: "", thumbnailUrl: "", videoUrl: "", visibility: "public" });
  };

  const globalStyles = `
    .ft-input:focus, .ft-textarea:focus {
      border-color: #e53e3e !important;
      outline: none;
      box-shadow: 0 0 0 3px rgba(229,62,62,0.08);
    }
    .ft-textarea { resize: vertical; font-family: inherit; }
    .vis-option:hover { border-color: #e53e3e !important; background: #fff1f1 !important; }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  `;

  const inputStyle = {
    width: "100%", padding: "10px 14px", borderRadius: "10px",
    border: "1px solid var(--border)", fontSize: "14px",
    background: "var(--bg)", color: "var(--text)", outline: "none",
    fontFamily: "inherit", transition: "border-color 0.2s, box-shadow 0.2s",
    boxSizing: "border-box",
  };
  const labelStyle = {
    fontSize: "12px", fontWeight: "600", color: "var(--text-muted)",
    display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px",
  };

  if (success) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{globalStyles}</style>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px" }}>
          <div style={{ maxWidth: "480px", width: "100%", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "24px", padding: "56px 48px", textAlign: "center", animation: "slideUp 0.4s ease" }}>
            <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "linear-gradient(135deg, #16a34a, #22c55e)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
              <FaCheckCircle size={40} color="#fff" />
            </div>
            <h2 style={{ fontSize: "26px", fontWeight: "700", color: "var(--text)", marginBottom: "10px" }}>Video Published!</h2>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "32px", lineHeight: "1.6" }}>Your video is now live on FluxTube and visible to everyone.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {uploadedVideoId && (
                <button onClick={() => router.push(`/video/${uploadedVideoId}`)}
                  style={{ padding: "13px 28px", borderRadius: "12px", border: "none", background: "#e53e3e", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                  <FaPlay size={13} /> Watch Video
                </button>
              )}
              <button onClick={() => router.push("/")}
                style={{ padding: "11px 28px", borderRadius: "12px", border: "1px solid var(--border)", background: "transparent", color: "var(--text)", fontWeight: "600", fontSize: "14px", cursor: "pointer" }}>
                Go to Home
              </button>
              <button onClick={resetAll}
                style={{ padding: "11px 28px", borderRadius: "12px", border: "none", background: "transparent", color: "#e53e3e", fontWeight: "600", fontSize: "14px", cursor: "pointer", textDecoration: "underline" }}>
                Upload Another Video
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{globalStyles}</style>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "24px 28px", overflowX: "hidden" }}>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h1 style={{ fontSize: "22px", fontWeight: "700", color: "var(--text)", marginBottom: "4px" }}>Upload Video</h1>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>Share your video with the FluxTube community</p>
            </div>
            <div style={{ display: "flex", background: "var(--chip-bg)", borderRadius: "12px", padding: "4px", border: "1px solid var(--border)" }}>
              {[{ id: "file", icon: <FaUpload size={12} />, label: "File Upload" }, { id: "link", icon: <FaLink size={12} />, label: "YouTube Link" }].map(({ id, icon, label }) => (
                <button key={id} onClick={() => { setMethod(id); setError(""); }}
                  style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 16px", borderRadius: "8px", border: "none", background: method === id ? "#e53e3e" : "transparent", color: method === id ? "#fff" : "var(--text-muted)", fontWeight: "600", fontSize: "13px", cursor: "pointer", transition: "all 0.2s" }}>
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 16px", borderRadius: "10px", background: "#fff1f1", border: "1px solid #fca5a5", color: "#b91c1c", fontSize: "14px", marginBottom: "20px" }}>
              <FaTimes size={14} />
              {error}
              <button onClick={() => setError("")} style={{ marginLeft: "auto", background: "none", border: "none", color: "#b91c1c", cursor: "pointer" }}><FaTimes size={12} /></button>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "20px", alignItems: "start" }}>

            <div>
              {method === "file" ? (
                <div>
                  <div
                    onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={e => { e.preventDefault(); setDragOver(false); handleFileSelect(e.dataTransfer.files[0]); }}
                    onClick={() => !selectedFile && fileInputRef.current?.click()}
                    style={{
                      border: `2px dashed ${dragOver ? "#e53e3e" : selectedFile ? "#16a34a" : "var(--border)"}`,
                      borderRadius: "16px", padding: selectedFile ? "24px" : "60px 40px",
                      textAlign: "center", cursor: selectedFile ? "default" : "pointer",
                      background: dragOver ? "#fff1f1" : "var(--card)",
                      transition: "all 0.2s", marginBottom: "16px",
                    }}>
                    {selectedFile ? (
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <div style={{ width: "120px", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#111", flexShrink: 0 }}>
                          {previewUrl && <video src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                        </div>
                        <div style={{ flex: 1, textAlign: "left" }}>
                          <p style={{ fontWeight: "700", color: "var(--text)", fontSize: "15px", marginBottom: "4px" }}>{selectedFile.name}</p>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "12px" }}>{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button onClick={() => fileInputRef.current?.click()}
                              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--text)", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                              Change File
                            </button>
                            <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }}
                              style={{ padding: "6px 14px", borderRadius: "8px", border: "1px solid #fca5a5", background: "#fff1f1", color: "#b91c1c", fontSize: "12px", fontWeight: "600", cursor: "pointer" }}>
                              Remove
                            </button>
                          </div>
                        </div>
                        <FaCheckCircle size={24} color="#16a34a" />
                      </div>
                    ) : (
                      <>
                        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "linear-gradient(135deg, #fff1f1, #fecaca)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                          <FaUpload size={28} color="#e53e3e" />
                        </div>
                        <p style={{ fontSize: "18px", fontWeight: "700", color: "var(--text)", marginBottom: "8px" }}>
                          {dragOver ? "Drop it here!" : "Drag & Drop Video Files to Upload"}
                        </p>
                        <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>or</p>
                        <button onClick={e => { e.stopPropagation(); fileInputRef.current?.click(); }}
                          style={{ padding: "10px 28px", borderRadius: "10px", background: "#e53e3e", color: "#fff", border: "none", fontWeight: "700", fontSize: "14px", cursor: "pointer" }}>
                          Select Files
                        </button>
                        <p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "16px" }}>MP4, MOV, AVI, MKV — up to 2GB</p>
                      </>
                    )}
                    <input ref={fileInputRef} type="file" accept="video/*" style={{ display: "none" }} onChange={e => handleFileSelect(e.target.files[0])} />
                  </div>

                  <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "20px" }}>
                    <label style={labelStyle}>Thumbnail</label>
                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <div style={{ width: "100px", aspectRatio: "16/9", borderRadius: "8px", overflow: "hidden", background: "var(--chip-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {customThumb || form.thumbnailUrl
                          ? <img src={customThumb || form.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <FaImage size={20} color="var(--text-muted)" />
                        }
                      </div>
                      <div style={{ flex: 1 }}>
                        <button onClick={() => thumbInputRef.current?.click()}
                          style={{ display: "block", marginBottom: "8px", padding: "8px 16px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--chip-bg)", color: "var(--text)", fontSize: "13px", fontWeight: "600", cursor: "pointer" }}>
                          Upload Thumbnail
                        </button>
                        <input className="ft-input" type="text" placeholder="Or paste image URL..."
                          value={form.thumbnailUrl} onChange={e => { setForm(f => ({ ...f, thumbnailUrl: e.target.value })); setCustomThumb(null); }}
                          style={{ ...inputStyle, fontSize: "12px", padding: "8px 12px" }} />
                        {/* FIX: don't store blob URL in form.thumbnailUrl */}
                        <input ref={thumbInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
                          const file = e.target.files[0];
                          if (file) { const url = URL.createObjectURL(file); setCustomThumb(url); setForm(f => ({ ...f, thumbnailUrl: "" })); }
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "32px" }}>
                  <div style={{ marginBottom: "24px" }}>
                    <label style={labelStyle}>YouTube / Video URL</label>
                    <div style={{ position: "relative" }}>
                      <FaLink style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={14} />
                      <input className="ft-input" type="text" placeholder="https://www.youtube.com/watch?v=..."
                        value={form.videoUrl} onChange={e => { setForm(f => ({ ...f, videoUrl: e.target.value })); setError(""); }}
                        style={{ ...inputStyle, paddingLeft: "40px" }} />
                    </div>
                  </div>

                  {ytId && (
                    <div style={{ marginBottom: "20px", borderRadius: "12px", overflow: "hidden", border: "1px solid var(--border)", animation: "fadeIn 0.3s ease" }}>
                      <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="thumbnail"
                        style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                      <div style={{ padding: "12px 14px", background: "var(--chip-bg)" }}>
                        <p style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>✓ YouTube video detected — thumbnail auto-filled</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label style={labelStyle}>Custom Thumbnail URL (optional)</label>
                    <input className="ft-input" type="text" placeholder="https://example.com/thumbnail.jpg"
                      value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))}
                      style={inputStyle} />
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: "700", color: "var(--text)", marginBottom: "16px" }}>Video Details</h3>

                <div style={{ width: "100%", aspectRatio: "16/9", borderRadius: "10px", overflow: "hidden", background: "#111", marginBottom: "16px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--border)" }}>
                  {previewUrl ? (
                    <video src={previewUrl} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : ytId ? (
                    <img src={`https://i.ytimg.com/vi/${ytId}/hqdefault.jpg`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (form.thumbnailUrl || customThumb) ? (
                    <img src={customThumb || form.thumbnailUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <MdVideoLibrary size={40} color="#555" />
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div>
                    <label style={labelStyle}>Title <span style={{ color: "#e53e3e" }}>*</span></label>
                    <input className="ft-input" type="text" placeholder="Enter video title"
                      value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Description</label>
                    <textarea className="ft-input ft-textarea" placeholder="Write a description for your video..."
                      value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                      rows={4} style={{ ...inputStyle, lineHeight: "1.6", minHeight: "100px" }} />
                  </div>
                  <div>
                    <label style={labelStyle}>Tags</label>
                    <input className="ft-input" type="text" placeholder="Add tags..."
                      value={form.tags} onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                      style={inputStyle} />
                    <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>Separate with commas</p>
                  </div>
                </div>
              </div>

              <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                <label style={labelStyle}>Visibility</label>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {[
                    { value: "public", icon: <FaGlobe size={14} />, label: "Public", sub: "Anyone can watch" },
                    { value: "unlisted", icon: <FaLink size={14} />, label: "Unlisted", sub: "Only with link" },
                    { value: "private", icon: <FaLock size={14} />, label: "Private", sub: "Only you" },
                  ].map(({ value, icon, label, sub }) => (
                    <label key={value} onClick={() => setForm(f => ({ ...f, visibility: value }))}
                      className="vis-option"
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 14px", borderRadius: "10px", border: `2px solid ${form.visibility === value ? "#e53e3e" : "var(--border)"}`, cursor: "pointer", background: form.visibility === value ? "#fff1f1" : "var(--bg)", transition: "all 0.2s" }}>
                      <span style={{ color: form.visibility === value ? "#e53e3e" : "var(--text-muted)" }}>{icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: "600", fontSize: "13px", color: "var(--text)" }}>{label}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-muted)" }}>{sub}</p>
                      </div>
                      <div style={{ width: "16px", height: "16px", borderRadius: "50%", border: `2px solid ${form.visibility === value ? "#e53e3e" : "var(--border)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {form.visibility === value && <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#e53e3e" }} />}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {submitting && method === "file" && (
                <div style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px", animation: "fadeIn 0.3s ease" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span style={{ fontSize: "13px", fontWeight: "600", color: "var(--text)" }}>Uploading...</span>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#e53e3e" }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${uploadProgress}%`, background: "linear-gradient(90deg, #e53e3e, #f87171)", borderRadius: "999px", transition: "width 0.2s ease" }} />
                  </div>
                  <p style={{ fontSize: "11px", color: "var(--text-muted)", marginTop: "6px" }}>Please don't close this page</p>
                </div>
              )}

              <button onClick={handlePublish} disabled={submitting}
                style={{ padding: "14px", borderRadius: "12px", border: "none", background: submitting ? "#f87171" : "#e53e3e", color: "#fff", fontWeight: "700", fontSize: "15px", cursor: submitting ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", transition: "background 0.2s" }}>
                {submitting ? (
                  <><div style={{ width: "16px", height: "16px", border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> Publishing...</>
                ) : (
                  <><FaRocket size={14} /> Publish</>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function UploadPage() {
  return (
    <ProtectedRoute pageName="Upload">
      <UploadContent />
    </ProtectedRoute>
  );
}