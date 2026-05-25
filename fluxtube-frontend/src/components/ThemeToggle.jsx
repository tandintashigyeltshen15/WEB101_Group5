"use client";
import { useTheme } from "../context/ThemeContext";

/**
 * ThemeToggle Component
 * A pill-shaped toggle switch that switches between dark and light mode.
 * - Uses ThemeContext to read and update the current theme
 * - Responsive: slightly larger on mobile for easier tapping
 * - Accessible: aria-label, aria-checked, role="switch" for screen readers
 */
export default function ThemeToggle() {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <>
      {/* Responsive size adjustment — larger tap target on mobile */}
      <style>{`
        .tt-track {
          width: 44px;
          height: 24px;
        }
        .tt-thumb {
          width: 18px;
          height: 18px;
          top: 3px;
        }
        .tt-thumb--on  { left: 23px; }
        .tt-thumb--off { left: 3px;  }

        /* On mobile: slightly bigger for easier tapping */
        @media (max-width: 640px) {
          .tt-track {
            width: 40px;
            height: 22px;
          }
          .tt-thumb {
            width: 16px;
            height: 16px;
            top: 3px;
          }
          .tt-thumb--on  { left: 21px; }
          .tt-thumb--off { left: 3px;  }
        }
      `}</style>

      <button
        className="tt-track"
        onClick={toggleTheme}

        // ── Accessibility attributes ──
        role="switch"                          // Tells screen readers this is a toggle
        aria-checked={darkMode}               // Current state: true = dark, false = light
        aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={darkMode ? "Switch to light mode" : "Switch to dark mode"}

        style={{
          borderRadius: "999px",
          border: "none",
          cursor: "pointer",
          position: "relative",
          flexShrink: 0,                       // Never shrink inside flex Navbar
          // Red when dark mode on, grey when light mode
          background: darkMode ? "#e53e3e" : "#dddddd",
          transition: "background 0.25s ease",
          // Minimum touch target size (WCAG recommends 44×44px)
          minWidth: "44px",
          minHeight: "24px",
          padding: 0,
          display: "inline-flex",
          alignItems: "center",
        }}
      >
        {/* ── Sliding thumb ──
            Moves right when dark mode is on, left when off */}
        <div
          className={`tt-thumb ${darkMode ? "tt-thumb--on" : "tt-thumb--off"}`}
          style={{
            position: "absolute",
            borderRadius: "50%",
            background: "#ffffff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.25)", // Subtle shadow for depth
            transition: "left 0.25s ease",
            pointerEvents: "none",                   // Thumb should not intercept clicks
          }}
        />

        {/* ── Icon inside thumb — sun or moon emoji ──
            Small visual hint of the current mode */}
        <span
          style={{
            position: "absolute",
            // Mirror the thumb position so icon stays centered inside it
            left: darkMode ? "23px" : "3px",
            fontSize: "10px",
            lineHeight: 1,
            userSelect: "none",
            pointerEvents: "none",
            transition: "left 0.25s ease",
            // Vertically centre inside track
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {darkMode ? "🌙" : "☀️"}
        </span>
      </button>
    </>
  );
}