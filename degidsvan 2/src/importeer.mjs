import { categorie, gemeenteNaam, gemeenteSlug, lees, schrijf, slug, verwijderd } from "./gids.mjs";

const OVERPASS = ["https://overpass-api.de/api/interpreter", "https://overpass.kumi.systems/api/interpreter"];

function query(gemeente) {
  const n = gemeente.replace(/"/g, '\\"');
  return `[out:json][timeout:120];
area["name"="${n}"]["boundary"="administrative"]["admin_level"="8"]->.a;
(
  nwr(area.a)["name"]["shop"];
  nwr(area.a)["name"]["craft"];
  nwr(area.a)["name"]["office"];
  nwr(area.a)["name"]["amenity"~"^(restaurant|cafe|bar|pub|fast_food|ice_cream|dentist|doctors|pharmacy|veterinary|driving_school|car_wash)$"];
  nwr(area.a)["name"]["healthcare"];
  nwr(area.a)["name"]["tourism"~"^(hotel|guest_house|motel)$"];
  nwr(area.a)["name"]["leisure"~"^(fitness_centre|sports_centre)$"];
);
out center tags;`;
}

const schoon = (s, max = 120) => (s ? String(s).trim().slice(0, max) : undefined);
function web(t) {
  let w = t.website || t["contact:website"] || t.url;
  if (!w) return undefined;
  w = String(w).trim();
  if (!/^https?:\/\//i.test(w)) w = "https://" + w;
  try { const u = new URL(w); return /^https?:$/.test(u.protocol) ? u.href.slice(0, 200) : undefined; } catch { return undefined; }
}

export async function importeer(gemeente) {
  const body = "data=" + encodeURIComponent(query(gemeente));
  let data, fout;
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: "POST", body, headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "DeGidsVan/1.0 (degidsvan.nl)" } });
      if (!r.ok) { fout = "HTTP " + r.status; continue; }
      data = await r.json(); break;
    } catch (e) { fout = e.message; }
  }
  if (!data) throw new Error("Overpass: " + fout);

  const weg = new Set(await verwijderd());
  const ps = gemeenteSlug(gemeente);
  const gezien = new Set();
  const bedrijven = [];
  for (const el of data.elements || []) {
    const t = el.tags || {};
    if (!t.name || t.disused || t["disused:shop"] || t.opening_hours === "closed") continue;
    if (t.shop === "vacant" || t.office === "government" || t.office === "religion" || t.office === "association" || t.office === "political_party") continue;
    const cat = categorie(t);
    if (!cat) continue;
    const id = el.type[0] + el.id;
    if (weg.has(id)) continue;
    const naam = schoon(t.name, 90);
    const sleutel = slug(naam) + "|" + (t["addr:street"] || "") + (t["addr:housenumber"] || "");
    if (gezien.has(sleutel)) continue;
    gezien.add(sleutel);
    bedrijven.push({
      id, naam, cat, plaats: ps,
      straat: schoon(t["addr:street"], 80), nr: schoon(t["addr:housenumber"], 12),
      pc: schoon(t["addr:postcode"], 8), woonplaats: schoon(t["addr:city"], 60),
      tel: schoon(t.phone || t["contact:phone"], 30), web: web(t),
      open: schoon(t.opening_hours, 160),
      lat: el.lat ?? el.center?.lat, lon: el.lon ?? el.center?.lon
    });
  }
  bedrijven.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  const nu = new Date().toISOString();
  await schrijf("plaats/" + ps, { slug: ps, naam: gemeenteNaam(gemeente), osm: gemeente, bijgewerkt: nu, bedrijven });

  const lijst = await lees("plaatsen", []);
  const i = lijst.findIndex((p) => p.slug === ps);
  const cats = {};
  for (const b of bedrijven) cats[b.cat] = (cats[b.cat] || 0) + 1;
  const rij = { slug: ps, naam: gemeenteNaam(gemeente), aantal: bedrijven.length, cats, bijgewerkt: nu };
  if (i >= 0) lijst[i] = rij; else lijst.push(rij);
  lijst.sort((a, b) => a.naam.localeCompare(b.naam, "nl"));
  await schrijf("plaatsen", lijst);
  return { gemeente, aantal: bedrijven.length };
}

/* Alle gemeenten van Nederland uit OpenStreetMap */
export async function alleGemeenten() {
  const q = `[out:json][timeout:120];area["ISO3166-1"="NL"][admin_level=2]->.nl;rel(area.nl)["boundary"="administrative"]["admin_level"="8"]["name"];out tags;`;
  for (const url of OVERPASS) {
    try {
      const r = await fetch(url, { method: "POST", body: "data=" + encodeURIComponent(q), headers: { "content-type": "application/x-www-form-urlencoded", "user-agent": "DeGidsVan/1.0 (degidsvan.nl)" } });
      if (!r.ok) continue;
      const d = await r.json();
      const namen = [...new Set((d.elements || []).map((e) => e.tags?.name).filter(Boolean))].sort((a, b) => a.localeCompare(b, "nl"));
      if (namen.length) return namen;
    } catch {}
  }
  throw new Error("Overpass niet bereikbaar");
}
