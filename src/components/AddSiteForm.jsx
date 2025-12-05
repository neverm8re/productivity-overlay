import React, { useState } from "react";

export default function AddSiteForm({ onAdd }) {
  const [input, setInput] = useState("");

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input);
      setInput("");
    }
  };

  return (
    <div style={{ marginTop: 16 }}>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="example.com or https://example.com"
        style={{
          width: "100%",
          padding: 12,
          boxSizing: "border-box",
          borderRadius: 8,
          border: "1px solid rgba(255,255,255,0.3)",
          background: "rgba(255,255,255,0.1)",
          color: "white",
          fontSize: 14,
          outline: "none",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
        <button
          onClick={handleAdd}
          style={{
            flex: 1,
            padding: 10,
            background: "linear-gradient(45deg, #ff6b6b, #ee5a24)",
            color: "white",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 500,
            transition: "transform 0.2s",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.05)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          ➕
        </button>
      </div>
    </div>
  );
}
