import { CAT, GEMEENTEN, lees, plaats, plaatsen, schrijf, slug, store } from "../../src/gids.mjs";
import { THEMAS, standaardFotos, vulThemaFotos } from "../../src/nieuws-bron.mjs";

const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json", "cache-control": "no-store" } });
const kort = (v, n = 200) => (v == null ? "" : String(v).trim().slice(0, n));
function url(v) {
  v = kort(v, 300); if (!v) return "";
  if (v.startsWith("/img/")) return v;
  if (!/^https?:\/\//i.test(v)) v = "https://" + v;
  try { const u = new URL(v); return /^https?:$/.test(u.protocol) ? u.href : ""; } catch { return ""; }
}

export default async (req) => {
  const key = process.env.ADMIN_KEY;
  if (!key || req.headers.get("x-key") !== key) return json({ fout: "Geen toegang" }, 401);
  if (req.method === "GET") {
    const [profielen, ps, status, nlog, nw, weg, tf] = await Promise.all([lees("profielen", []), plaatsen(), lees("import-status", { volgende: 0, log: [] }), lees("nieuws-log", null), lees("nieuws", []), lees("verwijderd", []), lees("thema-fotos", {}).then((s) => (THEMAS.some(([, t]) => !(s[t] || []).length) ? standaardFotos(s) : s))]);
    return json({ profielen, plaatsen: ps.map((p) => ({ slug: p.slug, naam: p.naam, aantal: p.aantal, bijgewerkt: p.bijgewerkt })), gemeenten: GEMEENTEN, cats: Object.values(CAT).map((c) => ({ slug: c.slug, naam: c.naam.charAt(0).toUpperCase() + c.naam.slice(1) })), status, nlog, nieuws: nw.slice(0, 40), verwijderd: weg.length, themas: THEMAS.map(([, t]) => t), themaFotos: tf, pexels: !!process.env.PEXELS_API_KEY, opslag: await store().list().then((l) => l.blobs.length).catch((e) => "fout: " + e.message) });
  }
  const b = await req.json().catch(() => ({}));
  const a = b.actie;

  if (a === "profiel") {
    const p = b.profiel || {};
    const lijst = await lees("profielen", []);
    const id = p.id && p.id.startsWith("p") ? p.id : "p" + Date.now().toString(36);
    const pl = slug(p.plaats);
    if (!kort(p.naam) || !pl || !CAT[p.cat]) return json({ fout: "Naam, plaats en categorie zijn verplicht." }, 400);
    const ps = await plaatsen();
    const rec = {
      id, naam: kort(p.naam, 90), cat: p.cat, plaats: pl, plaatsNaam: ps.find((x) => x.slug === pl)?.naam || kort(p.plaats, 60),
      straat: kort(p.straat, 80), nr: kort(p.nr, 12), pc: kort(p.pc, 8).toUpperCase(), woonplaats: kort(p.woonplaats, 60),
      tel: kort(p.tel, 30), email: kort(p.email, 120), web: url(p.web),
      open: kort(p.open, 400), kort: kort(p.kort, 160), omschrijving: kort(p.omschrijving, 4000), diensten: kort(p.diensten, 600),
      logo: url(p.logo), foto: url(p.foto),
      pakket: p.pakket === "plus" ? "plus" : "basis", uitgelicht: !!p.uitgelicht, actief: p.actief !== false,
      tot: /^\d{4}-\d{2}-\d{2}$/.test(p.tot || "") ? p.tot : "", osm: kort(p.osm, 20),
      klant: kort(p.klant, 200), bijgewerkt: new Date().toISOString()
    };
    const i = lijst.findIndex((x) => x.id === id);
    if (i >= 0) lijst[i] = { ...lijst[i], ...rec }; else lijst.unshift({ ...rec, aangemaakt: rec.bijgewerkt });
    await schrijf("profielen", lijst);
    return json({ ok: true, id, url: `/bedrijf/${pl}/${id}-${slug(rec.naam)}` });
  }
  if (a === "profiel-weg") {
    const lijst = (await lees("profielen", [])).filter((x) => x.id !== b.id);
    await schrijf("profielen", lijst);
    return json({ ok: true });
  }
  if (a === "afbeelding") {
    const m = String(b.data || "").match(/^data:(image\/(png|jpeg|webp|gif|svg\+xml));base64,(.+)$/);
    if (!m) return json({ fout: "Alleen png, jpg, webp, gif of svg." }, 400);
    const buf = Buffer.from(m[3], "base64");
    if (buf.length > 2_500_000) return json({ fout: "Afbeelding is groter dan 2,5 MB." }, 400);
    const id = "i" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await store().set("img/" + id, buf, { metadata: { type: m[1] } });
    return json({ ok: true, url: "/img/" + id });
  }
  if (a === "importeer") {
    const base = process.env.URL || new URL(req.url).origin;
    const r = await fetch(base + "/.netlify/functions/importeer-background", { method: "POST", headers: { "x-import-key": process.env.IMPORT_KEY || key, "content-type": "application/json" }, body: JSON.stringify(b.gemeente ? { gemeente: b.gemeente } : {}) });
    return json({ ok: r.status < 300, status: r.status });
  }
  if (a === "nieuws-ophalen") {
    const base = process.env.URL || new URL(req.url).origin;
    const r = await fetch(base + "/.netlify/functions/nieuws-background", { method: "POST", headers: { "x-import-key": process.env.IMPORT_KEY || key } });
    return json({ ok: r.status < 300, status: r.status });
  }
  if (a === "thema-foto") {
    const set = await lees("thema-fotos", {});
    const t = kort(b.thema, 30);
    if (!THEMAS.some(([, x]) => x === t)) return json({ fout: "Onbekend thema" }, 400);
    set[t] = set[t] || [];
    if (b.weg != null) set[t].splice(+b.weg, 1);
    else if (b.url) set[t].push({ url: url(b.url), eigen: true });
    await schrijf("thema-fotos", set);
    return json({ ok: true });
  }
  if (a === "thema-pexels") {
    if (!process.env.PEXELS_API_KEY) return json({ fout: "Zet eerst PEXELS_API_KEY in Netlify." }, 400);
    await vulThemaFotos(true);
    return json({ ok: true });
  }
  if (a === "nieuws-eigen") {
    const nw = await lees("nieuws", []);
    const titel = kort(b.titel, 200), tekst = kort(b.tekst, 6000);
    if (!titel || !tekst) return json({ fout: "Titel en tekst zijn verplicht." }, 400);
    nw.unshift({ id: slug(titel).slice(0, 70) + "-" + Date.now().toString(36).slice(-4), titel, tekst, url: "", datum: new Date().toISOString(), bron: "De Gids Van", eigen: true });
    await schrijf("nieuws", nw.slice(0, 150));
    return json({ ok: true });
  }
  if (a === "nieuws-weg") {
    await schrijf("nieuws", (await lees("nieuws", [])).filter((n) => n.id !== b.id));
    return json({ ok: true });
  }
  if (a === "bedrijf-weg") {
    const id = kort(b.id, 20), ps = slug(b.plaats);
    if (!id) return json({ fout: "Id ontbreekt" }, 400);
    const weg = new Set(await lees("verwijderd", [])); weg.add(id);
    await schrijf("verwijderd", [...weg]);
    if (ps) {
      const d = await plaats(ps);
      if (d) {
        d.bedrijven = d.bedrijven.filter((x) => x.id !== id);
        await schrijf("plaats/" + ps, d);
        const lijst = await plaatsen(); const p = lijst.find((x) => x.slug === ps);
        if (p) { p.aantal = d.bedrijven.length; p.cats = {}; for (const x of d.bedrijven) p.cats[x.cat] = (p.cats[x.cat] || 0) + 1; await schrijf("plaatsen", lijst); }
      }
    }
    return json({ ok: true });
  }
  if (a === "zoek-basis") {
    const d = await plaats(slug(b.plaats));
    const q = slug(b.q);
    return json({ resultaten: (d?.bedrijven || []).filter((x) => !q || slug(x.naam).includes(q)).slice(0, 20) });
  }
  return json({ fout: "Onbekende actie" }, 400);
};

export const config = { path: "/api/beheer" };
