import { GEMEENTEN, lees, schrijf } from "../../src/gids.mjs";
import { importeer, alleGemeenten } from "../../src/importeer.mjs";

const PER_RONDE = 10;
const wacht = (ms) => new Promise((r) => setTimeout(r, ms));

export default async (req) => {
  const sleutel = process.env.IMPORT_KEY || process.env.ADMIN_KEY;
  if (!sleutel || req.headers.get("x-import-key") !== sleutel) { console.log("import: geen toegang"); return new Response("nee", { status: 403 }); }
  let body = {};
  try { body = await req.json(); } catch {}
  /* lijst van alle Nederlandse gemeenten (eenmalig opgehaald en bewaard) */
  let lijst = await lees("gemeenten-lijst", null);
  if (!lijst || lijst.length < 300) {
    try { lijst = await alleGemeenten(); if (lijst.length >= 300) await schrijf("gemeenten-lijst", lijst); console.log("import: gemeentenlijst " + lijst.length); }
    catch (e) { console.log("import: gemeentenlijst mislukt " + e.message); lijst = GEMEENTEN; }
    if (!lijst || lijst.length < 300) lijst = GEMEENTEN;
  }
  const status = await lees("import-status", { volgende: 0, log: [] });
  const ronde = body.gemeente ? [body.gemeente] : Array.from({ length: PER_RONDE }, (_, i) => lijst[(status.volgende + i) % lijst.length]);
  console.log("import: start " + ronde.join(", "));
  for (const g of ronde) {
    try {
      const r = await importeer(g);
      status.log.unshift({ t: new Date().toISOString(), g, n: r.aantal });
      console.log("import: " + g + " " + r.aantal);
    } catch (e) {
      status.log.unshift({ t: new Date().toISOString(), g, fout: String(e.message).slice(0, 200) });
      console.log("import FOUT " + g + " " + e.message);
    }
    if (!body.gemeente) status.volgende = (status.volgende + 1) % lijst.length;
    status.totaal = lijst.length;
    status.log = status.log.slice(0, 80);
    await schrijf("import-status", status);
    await wacht(5000);
  }
};
