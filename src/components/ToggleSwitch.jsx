import React from "react";

export default function ToggleSwitch({ enabled, toggleEnabled }) {
  return (
    <div style={{ marginTop: 16 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={toggleEnabled}
          style={{ display: "none" }}
        />
        <div
          style={{
            width: 50,
            height: 24,
            background: enabled ? "#4CAF50" : "#ccc",
            borderRadius: 12,
            position: "relative",
            transition: "background 0.3s",
          }}
        >
          <div
            style={{
              width: 20,
              height: 20,
              background: "white",
              borderRadius: "50%",
              position: "absolute",
              top: 2,
              left: enabled ? 26 : 2,
              transition: "left 0.3s",
              boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            }}
          />
        </div>
        <span style={{ fontSize: 16, fontWeight: 500 }}>
          {enabled ? "🛡️ Blocking Enabled" : "🚫 Blocking Disabled"}
        </span>
      </label>
    </div>
  );
}
