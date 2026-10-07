export default function (c) {
  c.addPassthroughCopy({ "src/fonts": "fonts", "src/favicon.svg": "favicon.svg", "src/css": "css", "src/CNAME": "CNAME" });
  c.addFilter("n", (v) => Math.round(v).toLocaleString("en-US"));
  c.addFilter("m", (v) => (v / 1e6).toFixed(1) + "M");
  c.addFilter("name", (t) => ({ gptbot: "GPTBot", claudebot: "ClaudeBot", ccbot: "CCBot", "google-extended": "Google-Extended", amazonbot: "Amazonbot", bytespider: "Bytespider" })[t] || t);
  c.addFilter("cat", (k) => k.replace(/_/g, " "));
  c.addFilter("points", (rows, w, h, max) => rows.map((r, i) => `${(i * w / (rows.length - 1)).toFixed(1)},${(h - r[1] / max * h).toFixed(1)}`).join(" "));
  c.addFilter("slug", (t) => t.replace(/[^a-z0-9]+/gi, "-"));
  c.addFilter("top", (a, n) => a.slice(0, n));
  return { dir: { input: "src", output: "_site" } };
}
