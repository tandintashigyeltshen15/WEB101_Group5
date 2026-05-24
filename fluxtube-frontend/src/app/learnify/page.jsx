"use client";
import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import api from "../../lib/api";
import {
  FaCheckCircle, FaBrain, FaBullseye, FaClock,
  FaBook, FaStickyNote, FaRobot, FaTimes,
  FaPlay, FaSave, FaTrophy, FaRedo, FaPlus,
  FaSearch, FaGraduationCap,
} from "react-icons/fa";
import { MdQuiz } from "react-icons/md";

function ProgressRing({ pct, size = 110, stroke = 10, color = "#e53e3e" }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: "stroke-dashoffset 0.8s ease" }} />
    </svg>
  );
}

const COURSE_COLORS = ["#3b82f6","#f59e0b","#10b981","#06b6d4","#8b5cf6","#e53e3e","#f97316","#14b8a6"];

const DEFAULT_COURSES = [
  { id: "py",    title: "Python Full Course for Beginners",     thumb: "https://i.ytimg.com/vi/rfscVS0vtbw/hqdefault.jpg", lessons: 20, color: "#3b82f6", custom: false },
  { id: "js",    title: "JavaScript Full Course for Beginners", thumb: "https://i.ytimg.com/vi/W6NZfCO5SIk/hqdefault.jpg", lessons: 18, color: "#f59e0b", custom: false },
  { id: "html",  title: "HTML & CSS Full Course",               thumb: "https://i.ytimg.com/vi/G3e-cpL7ofc/hqdefault.jpg", lessons: 15, color: "#10b981", custom: false },
  { id: "react", title: "React JS Full Course",                 thumb: "https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg", lessons: 22, color: "#06b6d4", custom: false },
];

const QUIZ_BANK = {
  py:   [
    { q: "Which keyword defines a function in Python?", opts: ["func","def","function","lambda"], ans: 1 },
    { q: "What does `len([1,2,3])` return?",            opts: ["2","3","4","1"],                  ans: 1 },
    { q: "Which data type is immutable in Python?",     opts: ["list","dict","tuple","set"],       ans: 2 },
  ],
  js:   [
    { q: "Which operator checks value AND type?",       opts: ["==","===","!=","="],               ans: 1 },
    { q: "How do you declare a constant?",              opts: ["var","let","const","def"],         ans: 2 },
    { q: "What does `typeof []` return?",               opts: ["array","object","list","null"],    ans: 1 },
  ],
  html: [
    { q: "Which tag creates a hyperlink?",              opts: ["<link>","<a>","<href>","<nav>"],   ans: 1 },
    { q: "What does CSS stand for?",                    opts: ["Computer Style Sheets","Colorful Style Sheets","Cascading Style Sheets","Creative Style Sheets"], ans: 2 },
    { q: "Which is a block-level element?",             opts: ["<span>","<a>","<div>","<img>"],    ans: 2 },
  ],
  react:[
    { q: "What hook manages state in React?",           opts: ["useEffect","useRef","useState","useContext"], ans: 2 },
    { q: "JSX stands for…",                             opts: ["Java Syntax Extension","JavaScript XML","JSON XML","JavaScript Extra"], ans: 1 },
    { q: "Which method runs after render?",             opts: ["useState","useEffect","useMemo","useCallback"], ans: 1 },
  ],
};

export default function LearnifyPage() {
  const [progress, setProgress]       = useState({});
  const [notes, setNotes]             = useState({});
  const [courses, setCourses]         = useState(DEFAULT_COURSES);
  const [activeCourse, setActiveCourse] = useState(null);
  const [tab, setTab]                 = useState("course");
  const [quizState, setQuizState]     = useState(null);
  const [aiSummary, setAiSummary]     = useState("");
  const [aiLoading, setAiLoading]     = useState(false);
  const [noteText, setNoteText]       = useState("");
  const [videos, setVideos]           = useState([]);
  const [showModal, setShowModal]     = useState(false);
  const [search, setSearch]           = useState("");

  useEffect(() => {
    api.get("/videos").then(({ data }) => setVideos(data)).catch(() => {});
  }, []);

  useEffect(() => {
    try {
      const savedProgress = localStorage.getItem("flux_progress");
      const savedNotes    = localStorage.getItem("flux_notes");
      const savedCourses  = localStorage.getItem("flux_courses");
      if (savedProgress) setProgress(JSON.parse(savedProgress));
      if (savedNotes)    setNotes(JSON.parse(savedNotes));
      if (savedCourses)  setCourses(JSON.parse(savedCourses));
    } catch {}
  }, []);

  useEffect(() => { localStorage.setItem("flux_progress", JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem("flux_notes",    JSON.stringify(notes));    }, [notes]);
  useEffect(() => { localStorage.setItem("flux_courses",  JSON.stringify(courses));  }, [courses]);

  useEffect(() => {
    if (activeCourse) setNoteText(notes[activeCourse] || "");
  }, [activeCourse, tab]);

  const course = courses.find(c => c.id === activeCourse);
  const prog   = activeCourse ? (progress[activeCourse] || { done: 0, quizzesTaken: 0, avgScore: 0, watchTime: 0 }) : null;
  const pct    = course ? Math.round((prog.done / course.lessons) * 100) : 0;

  function addVideoAsCourse(video) {
    const alreadyAdded = courses.find(c => c.id === video._id);
    if (alreadyAdded) return;
    const colorIndex = courses.length % COURSE_COLORS.length;
    const newCourse = {
      id:      video._id,
      title:   video.title,
      thumb:   video.thumbnailUrl || "",
      lessons: 10,
      color:   COURSE_COLORS[colorIndex],
      custom:  true,
      videoUrl: video.videoUrl || "",
    };
    setCourses(prev => [...prev, newCourse]);
  }

  function removeCourse(courseId) {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourse === courseId) setActiveCourse(null);
  }

  function completeLesson() {
    setProgress(p => {
      const cur = p[activeCourse] || { done: 0, quizzesTaken: 0, avgScore: 0, watchTime: 0 };
      if (cur.done >= course.lessons) return p;
      return { ...p, [activeCourse]: { ...cur, done: cur.done + 1, watchTime: cur.watchTime + 45 } };
    });
  }

  function startQuiz() {
    setQuizState({ qi: 0, score: 0, done: false, answers: [] });
  }

  function answerQuiz(optIdx) {
    const questions = QUIZ_BANK[activeCourse] || generateGenericQuiz();
    const correct   = questions[quizState.qi].ans === optIdx;
    const newScore  = quizState.score + (correct ? 1 : 0);
    const newAnswers = [...quizState.answers, optIdx];
    if (quizState.qi + 1 >= questions.length) {
      const scorePct = Math.round((newScore / questions.length) * 100);
      setQuizState({ ...quizState, score: newScore, done: true, answers: newAnswers });
      setProgress(p => {
        const cur   = p[activeCourse] || { done: 0, quizzesTaken: 0, avgScore: 0, watchTime: 0 };
        const taken = cur.quizzesTaken + 1;
        const avg   = Math.round(((cur.avgScore * cur.quizzesTaken) + scorePct) / taken);
        return { ...p, [activeCourse]: { ...cur, quizzesTaken: taken, avgScore: avg } };
      });
    } else {
      setQuizState({ ...quizState, qi: quizState.qi + 1, score: newScore, answers: newAnswers });
    }
  }

  function generateGenericQuiz() {
    return [
      { q: "What is the main topic of this course?",  opts: ["Entertainment","Education","Gaming","Music"], ans: 1 },
      { q: "How do you best retain what you learned?", opts: ["Passive watching","Taking notes","Skipping","Guessing"], ans: 1 },
      { q: "What should you do after each lesson?",   opts: ["Nothing","Practice","Sleep","Skip"], ans: 1 },
    ];
  }

  async function generateSummary() {
  setAiLoading(true);
  setAiSummary("");
  const lastVideo = videos[0];
  const prompt = lastVideo
    ? `You are an educational AI assistant for FluxTube. Summarize this video for a student in 4-5 clear sentences. Video title: "${lastVideo.title}". Description: "${lastVideo.description || "No description"}". Focus on key learning points.`
    : `Summarize the key concepts of "${course?.title}" for a beginner student in 4-5 sentences.`;
  try {
    const response = await api.post("/ai/summary", { prompt });
    setAiSummary(response.data.summary || "Could not generate summary.");
  } catch {
    setAiSummary("Failed to generate summary. Please try again.");
  }
  setAiLoading(false);
}

  function saveNote() {
    setNotes(n => ({ ...n, [activeCourse]: noteText }));
    alert("Note saved!");
  }

  const totalLessons     = courses.reduce((s, c) => s + c.lessons, 0);
  const completedLessons = courses.reduce((s, c) => s + (progress[c.id]?.done || 0), 0);
  const totalQuizzes     = courses.reduce((s, c) => s + (progress[c.id]?.quizzesTaken || 0), 0);
  const avgScore         = totalQuizzes
    ? Math.round(courses.reduce((s, c) => s + ((progress[c.id]?.avgScore || 0) * (progress[c.id]?.quizzesTaken || 0)), 0) / totalQuizzes)
    : 0;
  const totalWatchMins   = courses.reduce((s, c) => s + (progress[c.id]?.watchTime || 0), 0);
  const overallPct       = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const filteredVideos = videos.filter(v =>
    v.title?.toLowerCase().includes(search.toLowerCase()) &&
    !courses.find(c => c.id === v._id)
  );

  const globalStyles = `
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes fadeIn { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
    @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
    .lesson-row:hover { background: var(--chip-bg) !important; }
    .course-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    .video-pick-card:hover { border-color: #e53e3e !important; background: #fff1f1 !important; }
  `;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <style>{globalStyles}</style>
      <Navbar />
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "24px", overflowX: "hidden", maxWidth: "1200px" }}>

          {/* Header */}
          <div style={{ marginBottom: "24px" }}>
            <h1 style={{ fontSize: "26px", fontWeight: "800", color: "var(--text)", margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
              <FaGraduationCap color="#e53e3e" /> Learnify
            </h1>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", margin: "4px 0 0" }}>Learn, practice and track your progress</p>
          </div>

          {/* Stats */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "28px" }}>
            {[
              { label: "Completed Lessons", value: `${completedLessons} / ${totalLessons}`, icon: <FaCheckCircle color="#10b981" size={20} /> },
              { label: "Quizzes Taken",     value: totalQuizzes,                             icon: <MdQuiz color="#3b82f6" size={20} /> },
              { label: "Avg Quiz Score",    value: `${avgScore}%`,                           icon: <FaBullseye color="#f59e0b" size={20} /> },
              { label: "Watch Time",        value: `${Math.floor(totalWatchMins/60)}h ${totalWatchMins%60}m`, icon: <FaClock color="#8b5cf6" size={20} /> },
            ].map(s => (
              <div key={s.label} style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", borderRadius: "14px", padding: "16px 18px" }}>
                <div style={{ marginBottom: "8px" }}>{s.icon}</div>
                <div style={{ fontSize: "22px", fontWeight: "800", color: "var(--text)" }}>{s.value}</div>
                <div style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "2px" }}>{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: activeCourse ? "1fr 1fr" : "1fr", gap: "24px" }}>

            {/* LEFT — Course list */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <h2 style={{ margin: 0, fontSize: "16px", fontWeight: "700", color: "var(--text)" }}>Course Mode</h2>
                <button onClick={() => setShowModal(true)}
                  style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "#e53e3e", background: "#fff1f1", border: "1px solid #fca5a5", borderRadius: "8px", padding: "6px 14px", cursor: "pointer", fontWeight: "600" }}>
                  <FaPlus size={11} /> View all / Add Course
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {courses.map(c => {
                  const p   = progress[c.id] || { done: 0 };
                  const pct = Math.round((p.done / c.lessons) * 100);
                  const active = activeCourse === c.id;
                  return (
                    <div key={c.id} className="course-card"
                      style={{
                        display: "flex", gap: "12px", alignItems: "center",
                        padding: "14px", borderRadius: "12px", cursor: "pointer",
                        background: active ? `${c.color}18` : "var(--chip-bg)",
                        border: `1px solid ${active ? c.color : "var(--border)"}`,
                        transition: "all 0.15s", position: "relative",
                      }}>
                      <div onClick={() => { setActiveCourse(c.id); setTab("course"); setQuizState(null); setAiSummary(""); }}
                        style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1 }}>
                        {c.thumb ? (
                          <img src={c.thumb} alt={c.title}
                            style={{ width: "72px", height: "45px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                            onError={e => e.target.style.display = "none"} />
                        ) : (
                          <div style={{ width: "72px", height: "45px", borderRadius: "8px", background: `${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <FaBook size={18} color={c.color} />
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: "0 0 4px", fontSize: "13px", fontWeight: "700", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</p>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <div style={{ flex: 1, height: "5px", background: "var(--border)", borderRadius: "999px", overflow: "hidden" }}>
                              <div style={{ height: "100%", width: `${pct}%`, background: c.color, borderRadius: "999px", transition: "width 0.5s" }} />
                            </div>
                            <span style={{ fontSize: "11px", color: "var(--text-muted)", flexShrink: 0 }}>{pct}%</span>
                          </div>
                          <p style={{ margin: "4px 0 0", fontSize: "11px", color: "var(--text-muted)" }}>
                            {p.done}/{c.lessons} lessons &nbsp;
                            {pct === 100 ? <span style={{ color: "#10b981", fontWeight: "600" }}>✅ Complete</span>
                              : pct > 0 ? <span style={{ color: c.color, fontWeight: "600" }}>🔄 In Progress</span>
                              : "⬜ Not started"}
                          </p>
                        </div>
                      </div>
                      {c.custom && (
                        <button onClick={e => { e.stopPropagation(); removeCourse(c.id); }}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px", borderRadius: "4px", flexShrink: 0 }}>
                          <FaTimes size={12} />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Overall progress ring */}
              <div style={{ marginTop: "20px", padding: "20px", borderRadius: "14px", background: "var(--chip-bg)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ position: "relative", flexShrink: 0 }}>
                  <ProgressRing pct={overallPct} />
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
                    <span style={{ fontSize: "18px", fontWeight: "800", color: "var(--text)" }}>{overallPct}%</span>
                    <span style={{ fontSize: "9px", color: "var(--text-muted)" }}>Overall</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: "0 0 8px", fontWeight: "700", fontSize: "14px", color: "var(--text)" }}>Progress Tracking</p>
                  {[
                    ["Completed Lessons", `${completedLessons} / ${totalLessons}`],
                    ["Quizzes Taken",     `${totalQuizzes}`],
                    ["Avg Quiz Score",    `${avgScore}%`],
                    ["Watch Time",        `${Math.floor(totalWatchMins/60)}h ${totalWatchMins%60}m`],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: "24px", fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                      <span>{k}</span><span style={{ fontWeight: "600", color: "var(--text)" }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT — Active course panel */}
            {activeCourse && course && (
              <div style={{ background: "var(--chip-bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "16px", animation: "fadeIn 0.2s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: course.color, flexShrink: 0 }} />
                  <p style={{ margin: 0, fontWeight: "700", fontSize: "15px", color: "var(--text)", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{course.title}</p>
                  <button onClick={() => setActiveCourse(null)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "18px" }}>
                    <FaTimes size={14} />
                  </button>
                </div>

                {/* Tabs */}
                <div style={{ display: "flex", gap: "6px" }}>
                  {[
                    { id: "course", icon: <FaBook size={11} />,      label: "Lessons"    },
                    { id: "notes",  icon: <FaStickyNote size={11} />, label: "Notes"      },
                    { id: "quiz",   icon: <MdQuiz size={13} />,       label: "Quiz"       },
                    { id: "ai",     icon: <FaRobot size={11} />,      label: "AI Summary" },
                  ].map(t => (
                    <button key={t.id} onClick={() => { setTab(t.id); setQuizState(null); }}
                      style={{
                        flex: 1, padding: "7px 4px", borderRadius: "8px", border: "none", cursor: "pointer",
                        fontSize: "11px", fontWeight: "600", display: "flex", alignItems: "center", justifyContent: "center", gap: "4px",
                        background: tab === t.id ? course.color : "var(--bg)",
                        color:      tab === t.id ? "#fff"       : "var(--text-muted)",
                        transition: "all 0.15s",
                      }}>
                      {t.icon} {t.label}
                    </button>
                  ))}
                </div>

                {/* Lessons tab */}
                {tab === "course" && (
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <div style={{ position: "relative", flexShrink: 0 }}>
                        <ProgressRing pct={pct} size={70} stroke={7} color={course.color} />
                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--text)" }}>{pct}%</span>
                        </div>
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: "13px", fontWeight: "700", color: "var(--text)" }}>{prog.done}/{course.lessons} lessons done</p>
                        <p style={{ margin: "3px 0 0", fontSize: "12px", color: "var(--text-muted)" }}>{course.lessons - prog.done} remaining</p>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", maxHeight: "320px", overflowY: "auto" }}>
                      {Array.from({ length: course.lessons }, (_, i) => {
                        const done    = i < prog.done;
                        const current = i === prog.done;
                        return (
                          <div key={i} className="lesson-row"
                            style={{
                              display: "flex", alignItems: "center", gap: "10px",
                              padding: "10px 12px", borderRadius: "9px", transition: "background 0.15s",
                              background: done ? `${course.color}12` : current ? "var(--bg)" : "transparent",
                              border: `1px solid ${done ? course.color + "40" : current ? "var(--border)" : "transparent"}`,
                            }}>
                            <div style={{
                              width: "22px", height: "22px", borderRadius: "50%", flexShrink: 0,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              background: done ? course.color : "var(--border)",
                              fontSize: "11px", color: done ? "#fff" : "var(--text-muted)",
                            }}>
                              {done ? <FaCheckCircle size={10} /> : i + 1}
                            </div>
                            <span style={{ flex: 1, fontSize: "12px", color: done ? "var(--text-muted)" : "var(--text)", textDecoration: done ? "line-through" : "none" }}>
                              Lesson {i + 1}
                            </span>
                            {current && (
                              <button onClick={completeLesson}
                                style={{ padding: "4px 10px", borderRadius: "6px", border: "none", background: course.color, color: "#fff", fontSize: "11px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
                                <FaCheckCircle size={9} /> Complete
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Notes tab */}
                {tab === "notes" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <p style={{ margin: 0, fontSize: "13px", color: "var(--text-muted)" }}>Notes for <strong>{course.title}</strong>:</p>
                    <textarea value={noteText} onChange={e => setNoteText(e.target.value)}
                      placeholder="Type your notes here..."
                      style={{ width: "100%", minHeight: "200px", padding: "12px", borderRadius: "10px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "13px", lineHeight: "1.6", resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
                    <button onClick={saveNote}
                      style={{ padding: "10px", borderRadius: "9px", border: "none", background: course.color, color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FaSave size={12} /> Save Notes
                    </button>
                  </div>
                )}

                {/* Quiz tab */}
                {tab === "quiz" && (
                  <div>
                    {!quizState && (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <FaBrain size={48} color={course.color} style={{ marginBottom: "12px" }} />
                        <p style={{ fontWeight: "700", fontSize: "15px", color: "var(--text)", margin: "0 0 6px" }}>Quiz: {course.title}</p>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 18px" }}>
                          {(QUIZ_BANK[activeCourse] || generateGenericQuiz()).length} questions • Test your knowledge
                        </p>
                        {prog.quizzesTaken > 0 && (
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 14px" }}>
                            Previous best: <strong style={{ color: course.color }}>{prog.avgScore}%</strong>
                          </p>
                        )}
                        <button onClick={startQuiz}
                          style={{ padding: "11px 28px", borderRadius: "10px", border: "none", background: course.color, color: "#fff", fontWeight: "700", fontSize: "14px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                          <FaPlay size={12} /> Start Quiz
                        </button>
                      </div>
                    )}
                    {quizState && !quizState.done && (() => {
                      const questions = QUIZ_BANK[activeCourse] || generateGenericQuiz();
                      const q = questions[quizState.qi];
                      return (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "14px" }}>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>Question {quizState.qi + 1} of {questions.length}</span>
                            <span style={{ fontSize: "12px", color: course.color, fontWeight: "600" }}>Score: {quizState.score}/{quizState.qi}</span>
                          </div>
                          <div style={{ height: "4px", background: "var(--border)", borderRadius: "999px", marginBottom: "16px" }}>
                            <div style={{ height: "100%", width: `${((quizState.qi)/questions.length)*100}%`, background: course.color, borderRadius: "999px", transition: "width 0.3s" }} />
                          </div>
                          <p style={{ fontWeight: "700", fontSize: "14px", color: "var(--text)", marginBottom: "14px", lineHeight: "1.4" }}>{q.q}</p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {q.opts.map((opt, i) => (
                              <button key={i} onClick={() => answerQuiz(i)}
                                style={{ padding: "11px 14px", borderRadius: "9px", textAlign: "left", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "13px", cursor: "pointer", transition: "all 0.12s" }}
                                onMouseEnter={e => e.currentTarget.style.borderColor = course.color}
                                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border)"}>
                                <span style={{ fontWeight: "700", color: course.color, marginRight: "8px" }}>{String.fromCharCode(65 + i)}.</span>
                                {opt}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                    {quizState?.done && (() => {
                      const questions = QUIZ_BANK[activeCourse] || generateGenericQuiz();
                      const scorePct  = Math.round((quizState.score / questions.length) * 100);
                      return (
                        <div style={{ textAlign: "center", padding: "10px 0" }}>
                          <FaTrophy size={48} color={scorePct >= 80 ? "#f59e0b" : scorePct >= 60 ? "#10b981" : "#6b7280"} style={{ marginBottom: "10px" }} />
                          <p style={{ fontWeight: "800", fontSize: "22px", color: course.color, margin: "0 0 4px" }}>{scorePct}%</p>
                          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: "0 0 16px" }}>
                            {quizState.score}/{questions.length} correct • {scorePct >= 80 ? "Excellent!" : scorePct >= 60 ? "Good job!" : "Keep studying!"}
                          </p>
                          <button onClick={startQuiz}
                            style={{ padding: "10px 22px", borderRadius: "9px", border: "none", background: course.color, color: "#fff", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                            <FaRedo size={11} /> Try Again
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* AI Summary tab */}
                {tab === "ai" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div style={{ padding: "14px", borderRadius: "10px", background: "linear-gradient(135deg, #e53e3e18, #7c3aed18)", border: "1px solid #e53e3e30" }}>
                      <p style={{ margin: "0 0 4px", fontWeight: "700", fontSize: "13px", color: "var(--text)", display: "flex", alignItems: "center", gap: "6px" }}>
                        <FaRobot color="#e53e3e" size={13} /> AI Summary
                      </p>
                      <p style={{ margin: 0, fontSize: "12px", color: "var(--text-muted)" }}>Powered by Claude · summarizes your last watched video</p>
                    </div>
                    {aiSummary && (
                      <div style={{ padding: "14px", borderRadius: "10px", background: "var(--bg)", border: "1px solid var(--border)", fontSize: "13px", lineHeight: "1.7", color: "var(--text)" }}>
                        {aiSummary}
                      </div>
                    )}
                    {!aiSummary && !aiLoading && (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)", textAlign: "center", padding: "12px 0" }}>
                        Click below to generate an AI summary of your last watched video.
                      </p>
                    )}
                    {aiLoading && (
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px" }}>
                        <div style={{ width: "20px", height: "20px", border: "2px solid var(--border)", borderTop: "2px solid #e53e3e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Generating summary...</span>
                      </div>
                    )}
                    <button onClick={generateSummary} disabled={aiLoading}
                      style={{ padding: "11px", borderRadius: "10px", border: "none", background: aiLoading ? "var(--border)" : "linear-gradient(135deg, #e53e3e, #7c3aed)", color: "#fff", fontWeight: "700", fontSize: "13px", cursor: aiLoading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                      <FaRobot size={12} /> {aiLoading ? "Generating..." : "Generate New Summary"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── VIEW ALL / ADD COURSE MODAL ── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease" }}>
          <div style={{ background: "var(--card, var(--bg))", border: "1px solid var(--border)", borderRadius: "20px", width: "100%", maxWidth: "680px", maxHeight: "80vh", display: "flex", flexDirection: "column", overflow: "hidden", animation: "slideUp 0.25s ease" }}>

            {/* Modal header */}
            <div style={{ padding: "20px 24px 16px", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "700", color: "var(--text)" }}>Add Courses from Your Videos</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "var(--text-muted)" }}>Select any video to add it as a course</p>
              </div>
              <button onClick={() => { setShowModal(false); setSearch(""); }}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "4px" }}>
                <FaTimes size={18} />
              </button>
            </div>

            {/* Search */}
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ position: "relative" }}>
                <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} size={13} />
                <input type="text" placeholder="Search videos..." value={search} onChange={e => setSearch(e.target.value)}
                  style={{ width: "100%", padding: "9px 12px 9px 36px", borderRadius: "9px", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text)", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
              </div>
            </div>

            {/* Current courses */}
            <div style={{ padding: "14px 24px 0" }}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Current Courses ({courses.length})
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "14px" }}>
                {courses.map(c => (
                  <div key={c.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", borderRadius: "20px", background: `${c.color}18`, border: `1px solid ${c.color}40`, fontSize: "12px", fontWeight: "600", color: c.color }}>
                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: c.color }} />
                    {c.title.length > 25 ? c.title.slice(0, 25) + "…" : c.title}
                    {c.custom && (
                      <button onClick={() => removeCourse(c.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: c.color, padding: "0", marginLeft: "2px", display: "flex" }}>
                        <FaTimes size={9} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Video list */}
            <div style={{ flex: 1, overflowY: "auto", padding: "0 24px 20px" }}>
              <p style={{ margin: "0 0 10px", fontSize: "12px", fontWeight: "600", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                Your Videos {filteredVideos.length > 0 ? `(${filteredVideos.length} available)` : ""}
              </p>
              {filteredVideos.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px", color: "var(--text-muted)" }}>
                  <FaBook size={32} style={{ marginBottom: "12px", opacity: 0.3 }} />
                  <p style={{ fontSize: "14px", margin: 0 }}>
                    {videos.length === 0 ? "No videos uploaded yet." : "All videos already added as courses!"}
                  </p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {filteredVideos.map(video => (
                    <div key={video._id} className="video-pick-card"
                      style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "12px", border: "1px solid var(--border)", background: "var(--chip-bg)", cursor: "pointer", transition: "all 0.15s" }}
                      onClick={() => addVideoAsCourse(video)}>
                      {video.thumbnailUrl ? (
                        <img src={video.thumbnailUrl} alt={video.title}
                          style={{ width: "80px", height: "50px", borderRadius: "8px", objectFit: "cover", flexShrink: 0 }}
                          onError={e => e.target.style.display = "none"} />
                      ) : (
                        <div style={{ width: "80px", height: "50px", borderRadius: "8px", background: "#e53e3e22", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <FaPlay size={16} color="#e53e3e" />
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: "0 0 3px", fontSize: "13px", fontWeight: "700", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{video.title}</p>
                        <p style={{ margin: 0, fontSize: "11px", color: "var(--text-muted)" }}>{video.description?.slice(0, 60) || "No description"}{video.description?.length > 60 ? "…" : ""}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 12px", borderRadius: "8px", background: "#e53e3e", color: "#fff", fontSize: "12px", fontWeight: "600", flexShrink: 0 }}>
                        <FaPlus size={10} /> Add
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}