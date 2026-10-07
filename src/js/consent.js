// Analytics choice: "yes" loads Google Analytics, anything else loads nothing.
const KEY = "analytics";
const dlg = document.getElementById("consent");
const get = () => { try { return localStorage.getItem(KEY); } catch { return null; } };
const set = (v) => { try { localStorage.setItem(KEY, v); } catch {} };
const choose = (v) => { set(v); dlg.close(); if (v === "yes") window.opencrawlersLoadAnalytics(); };
document.getElementById("consent-accept").addEventListener("click", () => choose("yes"));
document.getElementById("consent-reject").addEventListener("click", () => choose("no"));
document.getElementById("consent-open").addEventListener("click", () => dlg.showModal());
const saved = get();
if (saved === "yes") window.opencrawlersLoadAnalytics();
else if (saved !== "no") dlg.showModal();
