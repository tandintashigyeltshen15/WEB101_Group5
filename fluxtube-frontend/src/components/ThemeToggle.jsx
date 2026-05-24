"use client";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      style={{
        width: "44px",
        height: "24px",
        borderRadius: "999px",
        border: "none",
        cursor: "pointer",
        position: "relative",
        background: darkMode ? "#e53e3e" : "#dddddd",
        transition: "background 0.25s ease",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "3px",
          left: darkMode ? "23px" : "3px",
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          background: "#ffffff",
          transition: "left 0.25s ease",
        }}
      />
    </button>
  );
}