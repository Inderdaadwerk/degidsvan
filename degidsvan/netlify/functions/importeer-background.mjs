import { GEMEENTEN, lees, schrijf } from "../../src/gids.mjs";
import { importeer } from "../../src/importeer.mjs";

const PER_RONDE = 4;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  const sleutel = process.env.IMPORT_KEY || process.env.ADMIN_KEY;
  if (!sleutel || req.headers.get("x-import-key") !== sleutel) return new Response("nee", { status: 403 });
  let body = {};
  try { body = await req.json(); } catch {}
  const status = await lees("import-status", { volgende: 0, log: [] });
  const lijst = body.gemeente ? [body.gemeente] : Array.from({ length: PER_RONDE }, (_, i) => GEMEENTEN[(status.volgende + i) % GEMEENTEN.length]);
  for (const g of lijst) {
    try {
      const r = await importeer(g);
      status.log.unshift({ t: new Date().toISOString(), g, n: r.aantal });
    } catch (e) {
      status.log.unshift({ t: new Date().toISOString(), g, fout: String(e.message).slice(0, 200) });
    }
    if (!body.gemeente) status.volgende = (status.volgende + 1) % GEMEENTEN.length;
    status.log = status.log.slice(0, 60);
    await schrijf("import-status", status);
    await wacht(8000);
  }
};
