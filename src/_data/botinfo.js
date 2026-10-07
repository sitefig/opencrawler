import fs from "node:fs";
const dir = new URL("../../research/", import.meta.url);
export default Object.fromEntries(
  fs.readdirSync(dir).filter((f) => /^part-\d+\.json$/.test(f))
    .flatMap((f) => JSON.parse(fs.readFileSync(new URL(f, dir), "utf8")))
    .map((b) => [b.token, b])
);
