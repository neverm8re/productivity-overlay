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

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status !== "complete" || !tab.url) return;

  const current = normalize(tab.url);
  if (!current) return;

  chrome.storage.local.get(
    ["blockedSites", "enabled", "tempOverrides"],
    ({ blockedSites = [], enabled = true, tempOverrides = {} }) => {
      if (!enabled) return;
      if (!blockedSites.includes(current)) return;
      const expire = tempOverrides[current];
      if (expire && expire > Date.now()) return; 
      chrome.tabs.sendMessage(tabId, { action: "BLOCK" });
    }
  );
});
