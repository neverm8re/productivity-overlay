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

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.action === "BLOCK") applyBlockScreen();
});

function applyBlockScreen() {
  const domain = normalize(location.href);

  chrome.storage.local.get(["tempOverrides"], ({ tempOverrides = {} }) => {
    const expire = tempOverrides[domain];

    if (expire && expire > Date.now()) return; 

    showOverlay(domain);
  });
}

function showOverlay(domain) {
  if (document.getElementById("focus-overlay")) return;

  const overlay = document.createElement("div");
  overlay.id = "focus-overlay";

  overlay.innerHTML = `
    <style>
      #focus-overlay {
        position: fixed; top:0; left:0;
        width:100%; height:100%;
        background: rgba(0,0,0,0.9);
        color:white; z-index:9999999;
        display:flex; align-items:center; justify-content:center;
        font-family: 'JetBrains Mono', 'Fira Code', monospace;
        animation: fadeIn 0.5s ease-in;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
      .box {
        text-align:center; max-width:400px; padding: 30px;
        background: rgba(255,255,255,0.1);
        border-radius: 15px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.5);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255,255,255,0.2);
        animation: slideUp 0.5s ease-out;
      }
      @keyframes slideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      button {
        margin-top:20px; padding:12px 25px;
        border-radius:10px; border:none;
        cursor:pointer; font-size:16px; font-weight: 600;
        transition: all 0.3s ease;
        background: linear-gradient(45deg, #ff6b6b, #ee5a24);
        color: white;
      }
      button:hover {
        transform: scale(1.05);
        box-shadow: 0 8px 15px rgba(255,107,107,0.4);
      }
      h1 { font-size:48px; margin-bottom:10px; }
      p { font-size: 20px; margin-bottom: 15px; }
    </style>

    <div class="box">
      <h1>🚫 Blocked</h1>
      <p>This site is blocked for productivity.</p>
      <button id="override">⏱️ Take a 1-Minute Break</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const countdownSeconds = 60;
  const box = document.getElementById("overlay-box");

  // open for 1 minute
  document.getElementById("override").addEventListener("click", () => {
    chrome.storage.local.get(["tempOverrides"], ({ tempOverrides = {} }) => {
      tempOverrides[domain] = Date.now() + countdownSeconds * 1000;

      chrome.storage.local.set({ tempOverrides }, () => {
        overlay.remove();
        startLocalTimer(domain);
      });
    });
  });
}

function startLocalTimer(domain) {
  const interval = setInterval(() => {
    chrome.storage.local.get(["tempOverrides"], ({ tempOverrides = {} }) => {
      const expire = tempOverrides[domain];

      const remaining = Math.max(0, expire - Date.now());
      const sec = Math.ceil(remaining / 1000);

      if (sec <= 0) {
        clearInterval(interval);
        showOverlay(domain);
      }
    });
  }, 1000);
}
