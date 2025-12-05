import React from "react";

export default function SiteList({ sites, onRemove }) {
  return (
    <ul style={{ paddingLeft: 0, listStyle: "none" }}>
      {sites.length === 0 && (
        <li style={{ opacity: 0.7, fontStyle: "italic", textAlign: "center", padding: 20 }}>
          🌟 No blocked sites
        </li>
      )}
      {sites.map((site) => (
        <li
          key={site}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            padding: 10,
            marginBottom: 8,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 8,
            border: "1px solid rgba(255,255,255,0.2)",
          }}
        >
          <span style={{ fontSize: 14 }}>🔒 {site}</span>
          <button
            onClick={() => onRemove(site)}
            style={{
              padding: "6px 12px",
              background: "linear-gradient(45deg, #ff4757, #ff3838)",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
              fontSize: 12,
              transition: "transform 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.transform = "scale(1.1)")}
            onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
          >
            🗑️ Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
