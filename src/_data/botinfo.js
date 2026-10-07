import fs from "node:fs";
const dir = new URL("../../research/", import.meta.url);
const load = (re) => fs.readdirSync(dir).filter((f) => re.test(f)).sort()
  .flatMap((f) => JSON.parse(fs.readFileSync(new URL(f, dir), "utf8")));
const info = Object.fromEntries(load(/^part-\d+\.json$/).map((b) => [b.token, { source_type: "operator", ...b }]));
// patch-N.json fills gaps: only non-null fields override, so earlier verified data is kept.
for (const p of load(/^patch-\d+\.json$/)) {
  const base = info[p.token] ?? { token: p.token, notes: [] };
  if (base.verified) {
    // Operator-verified: keep its page and text, fill only missing fields, and say where they came from.
    for (const k of ["user_agent", "respects_robots", "ip_ranges_url"]) {
      if ((base[k] == null || base[k] === "unknown") && p[k] != null && p[k] !== "unknown") { base[k] = p[k]; base[k + "_src"] = p.doc_url; }
      // drop operator-page notes that now say the value is missing
    }
    if (base.user_agent_src) base.notes = (base.notes ?? []).filter((n) => !/user-agent.*(not (given|published|stated|shown|provided|listed)|no .*string)/i.test(n));
    {
    }
    continue;
  }
  for (const [k, v] of Object.entries(p)) if (v != null && !(Array.isArray(v) && !v.length)) base[k] = v;
  info[p.token] = base;
}
export default info;
