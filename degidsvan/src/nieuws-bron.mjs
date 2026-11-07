import { lees, schrijf, slug, store } from "./gids.mjs";

/* Openbare bronnen (Rijksoverheid: CC0). Probeert ze op volgorde en voegt samen. */
const FEEDS = [];
const RELEVANT = /ondernem|bedrijf|mkb|zzp|zelfstandig|werkgever|belasting|btw|kvk|economi|winkel|horeca|ondernemer|loon|subsidie|regel|vergunning|energie|personeel|arbeidsmarkt|innovatie|export|bouw|woning|vakantie|pensioen|minimumloon/i;

const ent = (s) => s.replace(/&nbsp;/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n)).replace(/&amp;/g, "&");
const ontsnap = (s) => ent(ent(String(s || "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")).replace(/<[^>]+>/g, " ")).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").replace(/\s+([.,;:!?])/g, "$1").trim();
const tag = (x, t) => { const m = x.match(new RegExp(`<${t}[^>]*>([\\s\\S]*?)</${t}>`, "i")); return m ? m[1] : ""; };

export function parseRss(xml, bron, filter) {
  const items = [];
  for (const m of xml.matchAll(/<item[\s>][\s\S]*?<\/item>/gi)) {
    const x = m[0];
    const titel = ontsnap(tag(x, "title"));
    const link = ontsnap(tag(x, "link")) || ontsnap(tag(x, "guid"));
    const tekst = ontsnap(tag(x, "description"));
    const d = new Date(ontsnap(tag(x, "pubDate")) || ontsnap(tag(x, "dc:date")));
    if (!titel || !/^https:\/\//.test(link)) continue;
    if (filter && !RELEVANT.test(titel + " " + tekst)) continue;
    items.push({
      id: slug(titel).slice(0, 70),
      titel: titel.slice(0, 200),
      tekst: tekst.slice(0, 1200),
      url: link,
      datum: isNaN(d) ? new Date().toISOString() : d.toISOString(),
      bron
    });
  }
  return items;
}

/* Open data-API van de Rijksoverheid (CC0) */
const OD = "https://opendata.rijksoverheid.nl/v1/sources/rijksoverheid/infotypes/news";
const API = [
  { url: OD + "/subjects/ondernemen-en-innovatie?output=json&rows=40", filter: false },
  { url: OD + "/subjects/belastingen-voor-ondernemers?output=json&rows=20", filter: false },
  { url: OD + "/subjects/werkgevers?output=json&rows=20", filter: false },
  { url: OD + "?output=json&rows=150", filter: true }
];
function datum(v) {
  if (!v) return new Date().toISOString();
  const s = String(v);
  const m = s.match(/^(\d{2})-(\d{2})-(\d{4})/);
  const d = m ? new Date(`${m[3]}-${m[2]}-${m[1]}T12:00:00Z`) : new Date(s);
  return isNaN(d) ? new Date().toISOString() : d.toISOString();
}
export function parseApi(json, filter) {
  const lijst = Array.isArray(json) ? json : json?.items || json?.result || json?.documents || [];
  const uit = [];
  for (const x of lijst) {
    const titel = ontsnap(x.title || x.titel);
    const url = String(x.canonical || x.url || "");
    const tekst = ontsnap(x.introduction || x.introductie || x.description || "");
    if (!titel || !/^https:\/\//.test(url)) continue;
    if (filter && !RELEVANT.test(titel + " " + tekst)) continue;
    uit.push({ id: slug(titel).slice(0, 70), titel: titel.slice(0, 200), tekst: tekst.slice(0, 1200), url, datum: datum(x.frontenddate || x.issued || x.available || x.lastmodified), bron: "Rijksoverheid" });
  }
  return uit;
}

export async function haalNieuws() {
  const bestaand = await lees("nieuws", []);
  const map = new Map(bestaand.map((n) => [n.url, n]));
  const log = [];
  for (const f of API) {
    try {
      const r = await fetch(f.url, { headers: { "user-agent": "DeGidsVan/1.0 (degidsvan.nl)", accept: "application/json" } });
      if (!r.ok) { log.push(f.url + " HTTP " + r.status); continue; }
      const txt = await r.text();
      let data; try { data = JSON.parse(txt); } catch { log.push(f.url + " geen JSON: " + txt.slice(0, 120).replace(/\s+/g, " ")); continue; }
      const items = parseApi(data, f.filter);
      log.push(f.url + " " + items.length + (items.length ? "" : " (structuur: " + JSON.stringify(data).slice(0, 160) + ")"));
      for (const it of items) if (!map.has(it.url)) map.set(it.url, it);
    } catch (e) { log.push(f.url + " " + e.message); }
  }
  for (const f of FEEDS) {
    try {
      const r = await fetch(f.url, { headers: { "user-agent": "DeGidsVan/1.0 (degidsvan.nl)", accept: "application/rss+xml, application/xml, text/xml" } });
      if (!r.ok) { log.push(f.url + " HTTP " + r.status); continue; }
      const items = parseRss(await r.text(), f.bron, f.filter);
      log.push(f.url + " " + items.length);
      for (const it of items) if (!map.has(it.url)) map.set(it.url, it);
    } catch (e) { log.push(f.url + " " + e.message); }
  }
  const eigen = bestaand.filter((n) => n.eigen);
  const alle = [...map.values()].filter((n) => !n.eigen).concat(eigen)
    .sort((a, b) => b.datum.localeCompare(a.datum)).slice(0, 120);
  console.log("nieuws: bronnen " + JSON.stringify(log));
  try { await fotos(alle, log); } catch (e) { log.push("foto's: " + e.message); }
  /* unieke id's */
  const ids = new Set();
  for (const n of alle) { let id = n.id || "bericht"; let k = 2; while (ids.has(id)) id = n.id + "-" + k++; n.id = id; ids.add(id); }
  await schrijf("nieuws", alle);
  await schrijf("nieuws-log", { tijd: new Date().toISOString(), log });
  return { aantal: alle.length, log };
}

/* ---------- foto's: rechtenvrije stockfoto's via Pexels (gratis API-sleutel), anders eigen illustratie ---------- */
export const THEMAS = [
  [/btw|belasting|fiscal|aangifte|toeslag/i, "belasting", "tax documents calculator"],
  [/minimumloon|loon|salaris|cao|pensioen/i, "loon", "salary payroll office"],
  [/energie|stroom|gas|zon|klimaat|duurzaam|warmte/i, "energie", "solar panels roof"],
  [/subsidie|regeling|steun|lening|krediet/i, "geld", "small business owner shop"],
  [/bouw|woning|huis|vergunning/i, "bouw", "construction site houses"],
  [/personeel|werkgever|arbeidsmarkt|werknemer|vacature|baan/i, "werk", "team meeting workplace"],
  [/export|handel|douane|haven|import/i, "handel", "shipping containers port"],
  [/innovatie|technolog|digitaal|cyber|ai\b|data/i, "digitaal", "technology laptop office"],
  [/nood|crisis|storing|veilig/i, "veilig", "emergency preparedness checklist"],
  [/horeca|winkel|retail|ondernemer|mkb|zzp/i, "ondernemer", "local shop owner"],
  [/./, "algemeen", "small business netherlands"]
];
export const thema = (n) => THEMAS.find(([re]) => re.test(n.titel + " " + n.tekst));
const hash = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); };

/* AI-beeld per bericht (OpenAI). Realistisch, zonder tekst, logo's of herkenbare echte personen. */
const SCENE = {
  belasting: "a Dutch small business owner reviewing tax paperwork and a calculator at a wooden desk in a bright office",
  loon: "a small Dutch company team at work, an employer handing over documents, modern office",
  energie: "solar panels on the roof of a Dutch business building, blue sky",
  geld: "a cheerful shop owner standing in the doorway of a small Dutch shopfront",
  bouw: "construction workers building new homes in a Dutch neighbourhood, brick houses",
  werk: "colleagues in a meeting around a table in a Dutch small business",
  handel: "shipping containers and cranes at the port of Rotterdam at golden hour",
  digitaal: "an entrepreneur working on a laptop in a modern Dutch co-working space",
  veilig: "a business owner checking an emergency checklist in a small company warehouse",
  ondernemer: "a local entrepreneur in a cosy Dutch shop serving a customer",
  algemeen: "a typical Dutch shopping street with small local businesses, people cycling"
};
async function aiBeeld(item) {
  const t = thema(item)?.[1] || "algemeen";
  const prompt = `Realistic editorial photograph for a Dutch business news article titled "${item.titel}". Scene: ${SCENE[t]}. Natural light, shot on a 35mm lens, authentic and candid, the Netherlands. No text, no letters, no logos, no flags, no recognizable real people or politicians.`;
  const r = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: { Authorization: "Bearer " + process.env.OPENAI_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ model: process.env.OPENAI_IMAGE_MODEL || "gpt-image-1", prompt, size: "1536x1024", quality: "medium", output_format: "jpeg", output_compression: 82, n: 1 })
  });
  if (!r.ok) throw new Error("OpenAI " + r.status + " " + (await r.text()).slice(0, 160));
  const j = await r.json();
  const b64 = j.data?.[0]?.b64_json;
  if (!b64) throw new Error("geen beeld ontvangen");
  const id = "n" + slug(item.id).slice(0, 40) + "-" + Date.now().toString(36);
  await store().set("img/" + id, Buffer.from(b64, "base64"), { metadata: { type: "image/jpeg" } });
  return "/img/" + id;
}

/* Standaardfoto's per thema (rechtenvrij, Pexels-licentie). Worden bij het eerste gebruik online gecontroleerd. */
const STANDAARD = {
  belasting: [6863329, 6963053, 7821688], loon: [3760069, 8101767, 7964253], energie: [9799994, 9875445, 30440447],
  geld: [30576160, 13057867, 10356910], bouw: [8961526, 10202865, 5579584], werk: [8518623, 3184374, 7869111],
  handel: [13025947, 28438290, 38726115], digitaal: [36733403, 10376018, 955405], veilig: [8293680, 13804490, 12234107],
  ondernemer: [40388634, 30848031, 18984821], algemeen: [18984821, 19250522, 30848031]
};
const pexelsFoto = (id) => ({ url: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&fit=crop`, klein: `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=480&h=320&fit=crop`, door: "Pexels", link: `https://www.pexels.com/photo/${id}/`, standaard: true });
export async function standaardFotos(set) {
  let gewijzigd = false;
  for (const [t, ids] of Object.entries(STANDAARD)) {
    if ((set[t] || []).length) continue;
    const ok = [];
    for (const id of ids) {
      const f = pexelsFoto(id);
      try { const r = await fetch(f.klein, { method: "GET", headers: { "user-agent": "DeGidsVan/1.0" } }); if (r.ok && (r.headers.get("content-type") || "").startsWith("image/")) ok.push(f); } catch {}
    }
    if (ok.length) { set[t] = ok; gewijzigd = true; }
  }
  if (gewijzigd) await schrijf("thema-fotos", set);
  return set;
}

/* Vaste foto's per thema: zelf geüpload in beheer, of één keer automatisch gevuld via Pexels */
export async function vulThemaFotos(forceer = false) {
  const set = await lees("thema-fotos", {});
  const sleutel = process.env.PEXELS_API_KEY;
  if (!sleutel) return set;
  for (const [, t, query] of THEMAS) {
    if (!forceer && (set[t] || []).length) continue;
    try {
      const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=6&orientation=landscape`, { headers: { Authorization: sleutel } });
      if (!r.ok) continue;
      const fotos = ((await r.json()).photos || []).slice(0, 4).map((p) => ({ url: p.src.large, klein: p.src.medium, door: p.photographer, link: p.url }));
      set[t] = [...(set[t] || []).filter((f) => f.eigen), ...fotos];
    } catch {}
  }
  await schrijf("thema-fotos", set);
  return set;
}

async function fotos(alle, log) {
  let set = await lees("thema-fotos", {});
  if (process.env.PEXELS_API_KEY && THEMAS.some(([, t]) => !(set[t] || []).length)) set = await vulThemaFotos();
  if (THEMAS.some(([, t]) => !(set[t] || []).length)) set = await standaardFotos(set);
  for (const item of alle) {
    if (item.foto && !item.themaFoto) continue;
    const t = thema(item)?.[1] || "algemeen";
    const lijst = (set[t] || []).length ? set[t] : set.algemeen || [];
    if (!lijst.length) { if (item.themaFoto) { delete item.foto; delete item.fotoKlein; delete item.fotoDoor; delete item.fotoLink; delete item.themaFoto; } continue; }
    const f = lijst[hash(item.id) % lijst.length];
    Object.assign(item, { foto: f.url, fotoKlein: f.klein || f.url, fotoDoor: f.door || "", fotoLink: f.link || "", themaFoto: true });
  }
  if (Object.values(set).some((l) => l && l.length)) return;
  if (process.env.OPENAI_API_KEY) {
    let n = 0;
    for (const item of alle) {
      if (item.foto || item.geenFoto) continue;
      if (++n > 6) break;
      try { item.foto = await aiBeeld(item); item.fotoKlein = item.foto; item.ai = true; }
      catch (e) { log.push("AI-beeld: " + e.message); break; }
    }
  }
  const sleutel = process.env.PEXELS_API_KEY;
  if (!sleutel) { if (!process.env.OPENAI_API_KEY) log.push("Geen beeldsleutel: eigen illustraties gebruikt"); return; }
  const cache = {};
  let n = 0;
  for (const item of alle) {
    if (item.foto || item.geenFoto) continue;
    if (++n > 15) break;
    const [, , query] = thema(item);
    try {
      if (!cache[query]) {
        const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape`, { headers: { Authorization: sleutel } });
        cache[query] = r.ok ? (await r.json()).photos || [] : [];
      }
      const lijst = cache[query];
      if (!lijst.length) { item.geenFoto = true; continue; }
      const gebruikt = new Set(alle.map((x) => x.fotoId).filter(Boolean));
      let p = lijst[hash(item.id) % lijst.length];
      for (let i = 0; i < lijst.length && gebruikt.has(p.id); i++) p = lijst[(hash(item.id) + i) % lijst.length];
      item.foto = p.src.large; item.fotoKlein = p.src.medium; item.fotoId = p.id;
      item.fotoDoor = String(p.photographer || "").slice(0, 60); item.fotoLink = p.url;
    } catch (e) { log.push("foto: " + e.message); }
  }
}
