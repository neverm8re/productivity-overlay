import React, { useEffect, useState } from "react";
import ToggleSwitch from "./components/ToggleSwitch";
import AddSiteForm from "./components/AddSiteForm";
import SiteList from "./components/SiteList";

function normalize(url) {
  try {
    if (!url.startsWith("http://") && !url.startsWith("https://"))
      url = "https://" + url;
    const u = new URL(url);
    let host = u.hostname.toLowerCase();
    if (host.startsWith("www.")) host = host.slice(4);
    return host;
  } catch {
    return null;
  }
}
async function getCurrentTabDomain() {
  return new Promise((resolve) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]?.url) return resolve(null);
      try {
        let u = new URL(tabs[0].url);
        let host = u.hostname.toLowerCase().replace(/^www\./, "");
        resolve(host);
      } catch {
        resolve(null);
      }
    });
  });
}

function App() {
  const [blockedSites, setBlockedSites] = useState([]);
  const [enabled, setEnabled] = useState(true);

  const [currentDomain, setCurrentDomain] = useState(null);
  const [remainingTime, setRemainingTime] = useState(null);
  useEffect(() => {
    chrome.storage.local.get(
      ["blockedSites", "enabled", "tempOverrides"],
      async (res) => {
        setBlockedSites(res.blockedSites || []);
        setEnabled(res.enabled ?? true);

        const domain = await getCurrentTabDomain();
        setCurrentDomain(domain);

        if (!domain) return;

        const expire = res.tempOverrides?.[domain];
        if (expire && expire > Date.now()) {
          setRemainingTime(expire - Date.now());
        }
      }
    );
  }, []);
  useEffect(() => {
    if (!remainingTime) return;

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (!prev) return null;

        const next = prev - 1000;
        if (next <= 0) {
          clearInterval(interval);
          setRemainingTime(null);
          chrome.storage.local.get(
            ["tempOverrides"],
            ({ tempOverrides = {} }) => {
              if (currentDomain) {
                delete tempOverrides[currentDomain];
                chrome.storage.local.set({ tempOverrides });
              }
            }
          );
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]) {
              chrome.tabs.sendMessage(tabs[0].id, { action: "BLOCK" });
            }
          });

          return null;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remainingTime, currentDomain]);
  const toggleEnabled = () => {
    chrome.storage.local.set({ enabled: !enabled }, () =>
      setEnabled((prev) => !prev)
    );
  };

  const addSite = (url) => {
    const normalized = normalize(url);
    if (!normalized) return alert("Incorrect URL");

    chrome.storage.local.get(["blockedSites"], ({ blockedSites = [] }) => {
      if (!blockedSites.includes(normalized)) {
        const updated = [...blockedSites, normalized];
        chrome.storage.local.set({ blockedSites: updated }, () =>
          setBlockedSites(updated)
        );
      }
    });
  };
  const removeSite = (site) => {
    const updated = blockedSites.filter((s) => s !== site);
    chrome.storage.local.set({ blockedSites: updated }, () =>
      setBlockedSites(updated)
    );
  };
  return (
    <div
      style={{
        padding: 20,
        width: 350,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "white",
        borderRadius: 12,
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
        minHeight: 400,
      }}
    >
      <h2 style={{ marginTop: 0, textAlign: "center", fontSize: 24, fontWeight: 300 }}>🚀 Productivity Overlay</h2>
      <ToggleSwitch enabled={enabled} toggleEnabled={toggleEnabled} />
      <AddSiteForm onAdd={addSite} />
      {remainingTime !== null && (
        <div
          style={{
            marginTop: 16,
            padding: 16,
            background: "rgba(255,255,255,0.1)",
            borderRadius: 10,
            textAlign: "center",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
          }}
        >
          <b style={{ fontSize: 16 }}>⏱️ Site temporarily unblocked</b>
          <br />
          <span style={{ fontSize: 28, fontWeight: "bold", color: "#ffd700" }}>
            {Math.floor(remainingTime / 60000)}:
            {(Math.floor(remainingTime / 1000) % 60)
              .toString()
              .padStart(2, "0")}
          </span>
        </div>
      )}

      {/* Blocked list */}
      <h4 style={{ marginTop: 20, fontSize: 18, fontWeight: 300 }}>📋 Blocked sites</h4>
      <SiteList sites={blockedSites} onRemove={removeSite} />

      <div style={{ marginTop: 16, textAlign: "center" }}>
        <small style={{ opacity: 0.8, fontSize: 12 }}>
          After changes, refresh blocked site tabs to apply updates
        </small>
      </div>
    </div>
  );
}

export default App;
