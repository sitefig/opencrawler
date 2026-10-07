"""Export AI-crawler stats from robotsdb analytics.sqlite to src/_data/stats.json (read-only)."""
import json, sqlite3, sys, pathlib
db = sys.argv[1] if len(sys.argv) > 1 else "../robotstxtanalysis/data/analytics.sqlite"
c = sqlite3.connect(f"file:{db}?mode=ro", uri=True)
q = lambda s, *a: c.execute(s, a).fetchall()
S = dict(q("select metric,value from summary where crawl='ALL'"))
AI = ("ai_training", "ai_assistant", "ai_search", "ai_scraper")
ph = ",".join("?" * len(AI))
bots = [dict(zip("token operator category mentioned blocked partial allowed eff_pct".split(), r)) for r in q(
    f"select token,operator,category,hosts_mentioning,hosts_blocked,hosts_partial,hosts_allowed,pct_hosts_effectively_blocked "
    f"from bots where crawl='ALL' and category in ({ph}) order by hosts_blocked desc", *AI)]
for b in bots:
    b["pct_blocked_of_mentions"] = round(100 * b["blocked"] / b["mentioned"], 1) if b["mentioned"] else 0
cats = [dict(zip("category mentioned blocking pct".split(), r)) for r in q(
    f"select category,hosts_mentioning_any,hosts_blocking_any,pct_hosts_blocking_any from bot_categories where crawl='ALL' and category in ({ph})", *AI)]
crawls = sorted(r[0] for r in q("select distinct crawl from summary where crawl like 'CC-MAIN-%'"))
trend = {}
for t in ("gptbot", "claudebot", "ccbot", "google-extended"):
    trend[t] = [[cr, q("select pct_hosts_blocked from bots where crawl=? and token=?", cr, t)[0][0]] for cr in crawls]
tlds = [dict(zip("tld hosts_with_robots blocks_ai_training pct".split(), r + (round(100 * r[2] / r[1], 1),))) for r in q(
    "select tld,hosts_with_robots,blocks_ai_training from tlds where crawl='ALL' and hosts_with_robots>=100000 order by 1.0*blocks_ai_training/hosts_with_robots desc limit 15")]
out = dict(hosts=S["hosts"], hosts_with_robots=S["hosts_with_robots_txt"], unique_files=S["unique_robots_txt_files"],
           captures=S["captures"], crawls=len(crawls) + 1, bots=bots, categories=cats, trend=trend, tlds=tlds)
L = dict(q("select metric,value from summary where crawl='LIVE-202609'"))
live = dict(hosts=L["hosts"], hosts_with_robots=L["hosts_with_robots_txt"], tag="LIVE-202609", bots=[
    dict(zip("token operator mentioned blocked pct".split(), r)) for r in q(
    f"select token,operator,hosts_mentioning,hosts_blocked,round(100.0*hosts_blocked/hosts_mentioning,1) from bots where crawl='LIVE-202609' and category in ({ph}) and hosts_mentioning>0 order by hosts_blocked desc limit 10", *AI)])
out["live"] = live
p = pathlib.Path("src/_data/stats.json"); p.write_text(json.dumps(out, indent=1))
print(p, p.stat().st_size, "bytes;", len(bots), "AI bots")
