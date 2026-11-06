import { CAT, CATS, catNaam, esc, nieuws, plaats, plaatsen, profielen, profielUrl, slug, store } from "../../src/gids.mjs";
import { SITE, TOPCATS, adresRegel, datalists, datumNL, fotoCredit, icoon, kaart, kruimel, layout, nieuwsBeeld, openNL, pager, zoekHero } from "../../src/ui.mjs";

const PER = 30;
const html = (body, status = 200, maxAge = 300) => new Response(body, { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": `public, max-age=60, s-maxage=${maxAge}` } });

const actief = (p) => p.actief !== false && (!p.tot || p.tot >= new Date().toISOString().slice(0, 10));
async function betaald() { return (await profielen()).filter(actief).map((p) => ({ ...p, betaald: true, uitgelicht: p.uitgelicht || p.pakket === "plus" })); }

function samenvoegen(basis, extra) {
  const verborgen = new Set(extra.map((p) => p.osm).filter(Boolean));
  const b = basis.filter((x) => !verborgen.has(x.id));
  return [...extra.sort((a, c) => (c.uitgelicht ? 1 : 0) - (a.uitgelicht ? 1 : 0)), ...b];
}

function catUitTekst(t) {
  const s = slug(t);
  if (!s) return null;
  if (CAT[s]) return s;
  for (const [c] of CATS) {
    const ev = slug(CAT[c].enkel), mv = slug(CAT[c].naam);
    if (mv === s || ev === s || ev + "s" === s || ev + "en" === s || (s.length >= 5 && (ev.startsWith(s) || s.startsWith(ev.slice(0, 6)))) || (s.length >= 4 && c.startsWith(s))) return c;
  }
  return null;
}

function nietGevonden(tekst = "Deze pagina bestaat niet (meer).") {
  return html(layout({ titel: "Niet gevonden", pad: "/404", body: `<section class="wrap blok"><h1>Niet gevonden</h1><p>${esc(tekst)}</p><p><a class="knop" href="/">Naar de homepage</a></p></section>` }), 404, 60);
}

/* ---------- pagina's ---------- */
async function home() {
  const [ps, nw, pr] = await Promise.all([plaatsen(), nieuws(), betaald()]);
  const totaal = ps.reduce((s, p) => s + (p.aantal || 0), 0);
  const uit = pr.filter((p) => p.uitgelicht).slice(0, 6);
  const cats = TOPCATS.map((c) => `<a class="cat" href="/categorie/${c}">${icoon(CAT[c].icoon)}<span>${esc(catNaam(c))}</span></a>`).join("");
  const top = [...ps].sort((a, b) => (b.aantal || 0) - (a.aantal || 0)).slice(0, 24);
  const [eerste, ...rest] = nw;
  const body = `${zoekHero(ps, totaal)}
<section class="wrap blok">
  <div class="sec-kop"><h2>Populaire categorieën</h2><a href="/categorieen">Alle categorieën</a></div>
  <div class="cats">${cats}</div>
</section>
${uit.length ? `<section class="wrap blok"><div class="sec-kop"><h2>Uitgelichte bedrijven</h2></div><div class="kaarten twee">${uit.map((b) => kaart(b, b.plaatsNaam)).join("")}</div></section>` : ""}
${eerste ? `<section class="nieuws-blok"><div class="wrap blok">
  <div class="sec-kop"><h2>Nieuws voor ondernemers</h2><a href="/nieuws">Al het nieuws</a></div>
  <div class="nw-grid">
    <a class="nw-groot" href="/nieuws/${esc(eerste.id)}">${nieuwsBeeld(eerste, "nw-groot-beeld", true)}<div class="nw-groot-txt"><span class="nw-datum">${datumNL(eerste.datum)} · ${esc(eerste.bron)}</span><h3>${esc(eerste.titel)}</h3><p>${esc(eerste.tekst.slice(0, 180))}${eerste.tekst.length > 180 ? "…" : ""}</p><span class="lees">Lees meer</span></div></a>
    <div class="nw-lijst">${rest.slice(0, 4).map((n) => `<a href="/nieuws/${esc(n.id)}">${nieuwsBeeld(n, "nw-duim")}<div><span class="nw-datum">${datumNL(n.datum)}</span><h3>${esc(n.titel)}</h3></div></a>`).join("")}</div>
  </div>
</div></section>` : ""}
${top.length ? `<section class="wrap blok"><div class="sec-kop"><h2>Zoek per plaats</h2><a href="/plaatsen">Alle plaatsen</a></div><div class="plaatsen">${top.map((p) => `<a href="/plaats/${p.slug}">${esc(p.naam)}<small>${(p.aantal || 0).toLocaleString("nl-NL")}</small></a>`).join("")}</div></section>` : ""}
<section class="wrap blok"><div class="cta">
  <div><h2>Staat uw bedrijf er nog niet bij?</h2><p>Meld uw bedrijf aan of vul uw vermelding aan met foto's, openingstijden en een omschrijving. Zo vinden klanten uit de buurt u sneller.</p></div>
  <div class="cta-k"><a class="knop zon" href="/aanmelden.html">Bedrijf aanmelden</a><a class="knop lijn-w" href="/wijzigen.html">Vermelding wijzigen</a></div>
</div></section>`;
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "WebSite", name: "De Gids Van", url: SITE, potentialAction: { "@type": "SearchAction", target: SITE + "/zoeken?wat={wat}", "query-input": "required name=wat" } })}</script>`;
  return html(layout({ pad: "/", body, home: true, jsonld: ld }));
}

async function zoeken(u) {
  const wat = (u.searchParams.get("wat") || "").trim().slice(0, 80);
  const waar = (u.searchParams.get("waar") || "").trim().slice(0, 60);
  const p = Math.max(1, parseInt(u.searchParams.get("p")) || 1);
  const ps = await plaatsen();
  const pl = waar ? ps.find((x) => x.slug === slug(waar)) || ps.find((x) => slug(x.naam).startsWith(slug(waar))) : null;
  const cat = catUitTekst(wat);
  if (pl && cat && wat.split(/\s+/).length <= 2) return Response.redirect(new URL(`/plaats/${pl.slug}/${cat}`, u).href, 302);
  if (!waar && cat) return Response.redirect(new URL(`/categorie/${cat}`, u).href, 302);
  if (pl && !wat) return Response.redirect(new URL(`/plaats/${pl.slug}`, u).href, 302);

  let res = [];
  const pr = await betaald();
  const q = slug(wat);
  const match = (b) => !q || (cat && b.cat === cat) || slug(b.naam).includes(q) || (b.diensten && slug(b.diensten).includes(q));
  if (pl) {
    const data = await plaats(pl.slug);
    res = samenvoegen((data?.bedrijven || []).filter(match), pr.filter((b) => b.plaats === pl.slug && match(b)));
  } else {
    res = pr.filter(match);
  }
  const titel = `${wat ? esc(wat) : "Bedrijven"}${pl ? " in " + esc(pl.naam) : ""}`;
  const basis = `/zoeken?wat=${encodeURIComponent(wat)}&waar=${encodeURIComponent(waar)}`;
  const deel = res.slice((p - 1) * PER, p * PER);
  const body = `<section class="wrap blok">
  ${kruimel([["Zoeken", null]])}
  <h1>${titel}</h1>
  <p class="sub">${res.length.toLocaleString("nl-NL")} resultaten${!pl && waar ? ` · plaats “${esc(waar)}” staat nog niet in de gids` : ""}${!waar ? " · tip: vul ook een plaats in" : ""}</p>
  <div class="kaarten">${deel.map((b) => kaart(b, pl?.naam || b.plaatsNaam)).join("") || `<p class="leeg">Geen bedrijven gevonden. Probeer een andere zoekterm of <a href="/plaatsen">kies een plaats</a>.</p>`}</div>
  ${pager(p, res.length, PER, basis)}
</section>${datalists(ps)}`;
  return html(layout({ titel: `${wat || "Zoeken"}${pl ? " in " + pl.naam : ""}`, pad: "/zoeken", body, zoek: { wat, waar } }), 200, 60);
}

async function plaatsenPagina() {
  const ps = await plaatsen();
  const groepen = {};
  for (const p of ps) { const l = p.naam.replace(/^'s-/, "").charAt(0).toUpperCase(); (groepen[l] ||= []).push(p); }
  const body = `<section class="wrap blok">${kruimel([["Plaatsen", null]])}<h1>Alle plaatsen</h1><p class="sub">Kies een plaats om de bedrijven te bekijken.</p>
  ${Object.keys(groepen).sort().map((l) => `<h2 class="letter">${l}</h2><div class="plaatsen">${groepen[l].map((p) => `<a href="/plaats/${p.slug}">${esc(p.naam)}<small>${(p.aantal || 0).toLocaleString("nl-NL")}</small></a>`).join("")}</div>`).join("") || '<p class="leeg">De plaatsen worden op dit moment ingeladen. Kom straks terug.</p>'}
</section>${datalists(ps)}`;
  return html(layout({ titel: "Alle plaatsen", omschrijving: "Bekijk bedrijven per plaats in De Gids Van.", pad: "/plaatsen", body }));
}

async function categorieenPagina() {
  const ps = await plaatsen();
  const tel = {};
  for (const p of ps) for (const [c, n] of Object.entries(p.cats || {})) tel[c] = (tel[c] || 0) + n;
  const body = `<section class="wrap blok">${kruimel([["Categorieën", null]])}<h1>Alle categorieën</h1>
  <div class="cats veel">${CATS.map(([c]) => `<a class="cat" href="/categorie/${c}">${icoon(CAT[c].icoon)}<span>${esc(catNaam(c))}${tel[c] ? `<small>${tel[c].toLocaleString("nl-NL")}</small>` : ""}</span></a>`).join("")}</div>
</section>${datalists(ps)}`;
  return html(layout({ titel: "Alle categorieën", pad: "/categorieen", body }));
}

async function categoriePagina(c) {
  if (!CAT[c]) return nietGevonden();
  const ps = (await plaatsen()).filter((p) => p.cats?.[c]).sort((a, b) => b.cats[c] - a.cats[c]);
  const pr = (await betaald()).filter((b) => b.cat === c);
  const body = `<section class="wrap blok">${kruimel([["Categorieën", "/categorieen"], [catNaam(c), null]])}
  <h1>${esc(catNaam(c))} in Nederland</h1><p class="sub">Kies een plaats om ${esc(CAT[c].naam)} bij u in de buurt te vinden.</p>
  ${pr.length ? `<div class="kaarten twee">${pr.slice(0, 6).map((b) => kaart(b, b.plaatsNaam)).join("")}</div>` : ""}
  <div class="plaatsen">${ps.map((p) => `<a href="/plaats/${p.slug}/${c}">${esc(p.naam)}<small>${p.cats[c]}</small></a>`).join("") || '<p class="leeg">Nog geen bedrijven in deze categorie.</p>'}</div>
</section>${datalists(await plaatsen())}`;
  return html(layout({ titel: `${catNaam(c)} in Nederland`, omschrijving: `Vind ${CAT[c].naam} bij u in de buurt in De Gids Van.`, pad: `/categorie/${c}`, body, zoek: { wat: catNaam(c), waar: "" } }));
}

async function plaatsPagina(ps, c, u) {
  const data = await plaats(ps);
  if (!data) return nietGevonden("Deze plaats staat (nog) niet in de gids.");
  if (c && !CAT[c]) return nietGevonden();
  const p = Math.max(1, parseInt(u.searchParams.get("p")) || 1);
  const pr = (await betaald()).filter((b) => b.plaats === ps && (!c || b.cat === c));
  const lijst = samenvoegen(data.bedrijven.filter((b) => !c || b.cat === c), pr);
  const tel = {};
  for (const b of data.bedrijven) tel[b.cat] = (tel[b.cat] || 0) + 1;
  const titel = c ? `${catNaam(c)} in ${data.naam}` : `Bedrijven in ${data.naam}`;
  const deel = lijst.slice((p - 1) * PER, p * PER);
  const tegels = !c ? `<div class="cats veel klein">${CATS.filter(([x]) => tel[x]).sort((a, b) => tel[b[0]] - tel[a[0]]).map(([x]) => `<a class="cat" href="/plaats/${ps}/${x}">${icoon(CAT[x].icoon)}<span>${esc(catNaam(x))}<small>${tel[x]}</small></span></a>`).join("")}</div><h2 class="tussen">Alle bedrijven in ${esc(data.naam)}</h2>` : "";
  const body = `<section class="wrap blok">
  ${kruimel(c ? [["Plaatsen", "/plaatsen"], [data.naam, `/plaats/${ps}`], [catNaam(c), null]] : [["Plaatsen", "/plaatsen"], [data.naam, null]])}
  <h1>${esc(titel)}</h1>
  <p class="sub">${lijst.length.toLocaleString("nl-NL")} ${c ? esc(CAT[c].naam) : "bedrijven"} gevonden</p>
  ${tegels}
  <div class="kaarten">${deel.map((b) => kaart(b, data.naam)).join("") || '<p class="leeg">Nog geen bedrijven gevonden.</p>'}</div>
  ${pager(p, lijst.length, PER, `/plaats/${ps}${c ? "/" + c : ""}`)}
  <p class="bron">Laatst bijgewerkt: ${datumNL(data.bijgewerkt)}. Staat uw bedrijf er niet bij? <a href="/aanmelden.html">Meld het gratis aan</a>.</p>
</section>${datalists(await plaatsen())}`;
  return html(layout({ titel, omschrijving: `${titel}: adressen, telefoonnummers en openingstijden in De Gids Van.`, pad: `/plaats/${ps}${c ? "/" + c : ""}${p > 1 ? "?p=" + p : ""}`, body, zoek: { wat: c ? catNaam(c) : "", waar: data.naam } }));
}

async function bedrijfPagina(ps, rest) {
  const id = rest.split("-")[0];
  let b, data = await plaats(ps);
  if (id.startsWith("p")) b = (await betaald()).find((x) => x.id === id && x.plaats === ps);
  else b = data?.bedrijven.find((x) => x.id === id);
  if (!b) return nietGevonden("Dit bedrijf staat niet (meer) in de gids.");
  const plaatsNaam = data?.naam || b.plaatsNaam || ps;
  const cat = CAT[b.cat];
  const adr = adresRegel(b);
  const kaartUrl = b.lat ? `https://www.openstreetmap.org/?mlat=${b.lat}&mlon=${b.lon}#map=18/${b.lat}/${b.lon}` : adr ? `https://www.openstreetmap.org/search?query=${encodeURIComponent(adr)}` : "";
  const anderen = (data?.bedrijven || []).filter((x) => x.cat === b.cat && x.id !== b.id && x.id !== b.osm).slice(0, 5);
  const telLink = b.tel ? b.tel.replace(/[^+\d]/g, "") : "";
  const ld = `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "LocalBusiness", name: b.naam, url: SITE + profielUrl(b), telephone: b.tel || undefined, address: adr ? { "@type": "PostalAddress", streetAddress: [b.straat, b.nr].filter(Boolean).join(" ") || undefined, postalCode: b.pc || undefined, addressLocality: b.woonplaats || plaatsNaam, addressCountry: "NL" } : undefined, geo: b.lat ? { "@type": "GeoCoordinates", latitude: b.lat, longitude: b.lon } : undefined })}</script>`;
  const body = `<section class="wrap blok">
  ${kruimel([[plaatsNaam, `/plaats/${ps}`], [catNaam(b.cat), `/plaats/${ps}/${b.cat}`], [b.naam, null]])}
  <div class="profiel${b.betaald ? " betaald" : ""}">
    <div class="pr-hoofd">
      ${b.foto ? `<img class="pr-foto" src="${esc(b.foto)}" alt="${esc(b.naam)}">` : ""}
      <div class="pr-titel">
        ${b.logo ? `<img class="pr-logo" src="${esc(b.logo)}" alt="Logo ${esc(b.naam)}">` : `<span class="pr-ic">${icoon(cat?.icoon || "doc")}</span>`}
        <div><h1>${esc(b.naam)}${b.betaald ? ' <span class="badge" title="Geverifieerd profiel">✓ Geverifieerd</span>' : ""}</h1>
        <p class="sub">${esc(cat?.enkel || "Bedrijf")} in ${esc(b.woonplaats || plaatsNaam)}</p></div>
      </div>
      ${b.omschrijving ? `<div class="pr-tekst">${esc(b.omschrijving).split(/\n{2,}/).map((x) => `<p>${x.replace(/\n/g, "<br>")}</p>`).join("")}</div>` : ""}
      ${b.diensten ? `<h2>Diensten</h2><ul class="diensten">${b.diensten.split(",").map((d) => d.trim()).filter(Boolean).map((d) => `<li>${esc(d)}</li>`).join("")}</ul>` : ""}
      ${b.open ? `<h2>Openingstijden</h2><p class="open">${esc(openNL(b.open)).replace(/\n/g, "<br>")}</p>` : ""}
    </div>
    <aside class="pr-zij">
      <h2>Contact</h2>
      <dl>
        ${adr ? `<dt>Adres</dt><dd>${esc(adr)}${kaartUrl ? `<br><a href="${kaartUrl}" rel="noopener" target="_blank">Bekijk op de kaart</a>` : ""}</dd>` : ""}
        ${b.tel ? `<dt>Telefoon</dt><dd><a href="tel:${esc(telLink)}">${esc(b.tel)}</a></dd>` : ""}
        ${b.email && b.betaald ? `<dt>E-mail</dt><dd><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></dd>` : ""}
        ${b.web ? `<dt>Website</dt><dd><a href="${esc(b.web)}" rel="noopener nofollow" target="_blank">${esc(b.web.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""))}</a></dd>` : ""}
      </dl>
      ${b.tel ? `<a class="knop breed" href="tel:${esc(telLink)}">Bel ${esc(b.naam.length > 22 ? "dit bedrijf" : b.naam)}</a>` : ""}
      ${b.web ? `<a class="knop breed lijn" href="${esc(b.web)}" rel="noopener nofollow" target="_blank">Naar de website</a>` : ""}
      ${b.betaald ? "" : `<div class="eigen"><b>Is dit uw bedrijf?</b><p>Vul uw vermelding aan met foto's, een omschrijving en openingstijden, of laat gegevens aanpassen of verwijderen.</p><a href="/wijzigen.html?id=${esc(b.id)}&amp;naam=${encodeURIComponent(b.naam)}&amp;plaats=${esc(ps)}">Vermelding beheren</a></div>`}
    </aside>
  </div>
  ${anderen.length ? `<h2 class="tussen">Meer ${esc(cat?.naam || "bedrijven")} in ${esc(plaatsNaam)}</h2><div class="kaarten">${anderen.map((x) => kaart(x, plaatsNaam)).join("")}</div>` : ""}
  ${b.betaald ? "" : `<p class="bron">Basisgegevens afkomstig uit openbare bronnen (© OpenStreetMap-bijdragers). Kloppen ze niet? <a href="/wijzigen.html?id=${esc(b.id)}&amp;naam=${encodeURIComponent(b.naam)}&amp;plaats=${esc(ps)}">Geef het door</a>.</p>`}
</section>`;
  return html(layout({ titel: `${b.naam} – ${cat?.enkel || "Bedrijf"} in ${b.woonplaats || plaatsNaam}`, omschrijving: `${b.naam}, ${cat?.enkel || "bedrijf"} in ${b.woonplaats || plaatsNaam}. ${adr ? "Adres: " + adr + ". " : ""}${b.tel ? "Telefoon: " + b.tel + "." : ""}`, pad: profielUrl(b), body, jsonld: ld, zoek: { wat: "", waar: plaatsNaam } }));
}

async function nieuwsPagina(u) {
  const nw = await nieuws();
  const p = Math.max(1, parseInt(u.searchParams.get("p")) || 1);
  const per = 15, deel = nw.slice((p - 1) * per, p * per);
  const body = `<section class="wrap blok smal">${kruimel([["Nieuws", null]])}<h1>Nieuws voor ondernemers</h1>
  <p class="sub">Het laatste nieuws en nieuwe regels voor ondernemers, automatisch bijgewerkt.</p>
  <div class="nw-alle">${deel.map((n) => `<a class="nw-item" href="/nieuws/${esc(n.id)}">${nieuwsBeeld(n, "nw-duim groot")}<div><span class="nw-datum">${datumNL(n.datum)} · ${esc(n.bron)}</span><h2>${esc(n.titel)}</h2><p>${esc(n.tekst.slice(0, 200))}${n.tekst.length > 200 ? "…" : ""}</p></div></a>`).join("") || '<p class="leeg">Het nieuws wordt binnenkort geladen.</p>'}</div>
  ${pager(p, nw.length, per, "/nieuws")}
</section>`;
  return html(layout({ titel: "Nieuws voor ondernemers", omschrijving: "Actueel nieuws voor ondernemers: regels, belastingen en economie.", pad: "/nieuws", body }));
}

async function berichtPagina(id) {
  const nw = await nieuws();
  const n = nw.find((x) => x.id === id);
  if (!n) return nietGevonden("Dit nieuwsbericht bestaat niet (meer).");
  const meer = nw.filter((x) => x.id !== id).slice(0, 4);
  const body = `<section class="wrap blok smal">${kruimel([["Nieuws", "/nieuws"], [n.titel.slice(0, 50) + (n.titel.length > 50 ? "…" : ""), null]])}
  <article class="bericht"><span class="nw-datum">${datumNL(n.datum)} · ${esc(n.bron)}</span><h1>${esc(n.titel)}</h1>${nieuwsBeeld(n, "bericht-beeld", true)}${fotoCredit(n)}
  ${esc(n.tekst).split(/\n{2,}/).map((x) => `<p>${x.replace(/\n/g, "<br>")}</p>`).join("")}
  ${n.eigen ? "" : `<p class="bron-blok">Bron: ${esc(n.bron)}. <a class="knop" href="${esc(n.url)}" rel="noopener" target="_blank">Lees het volledige bericht</a></p>`}
  </article>
  ${meer.length ? `<h2 class="tussen">Meer nieuws</h2><div class="nw-alle">${meer.map((m) => `<a class="nw-item" href="/nieuws/${esc(m.id)}">${nieuwsBeeld(m, "nw-duim")}<div><span class="nw-datum">${datumNL(m.datum)}</span><h2>${esc(m.titel)}</h2></div></a>`).join("")}</div>` : ""}
</section>`;
  return html(layout({ titel: n.titel, omschrijving: n.tekst.slice(0, 155), pad: `/nieuws/${n.id}`, body, jsonld: `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@type": "NewsArticle", headline: n.titel, datePublished: n.datum, publisher: { "@type": "Organization", name: "De Gids Van" } })}</script>` }));
}

async function sitemap() {
  const [ps, nw, pr] = await Promise.all([plaatsen(), nieuws(), betaald()]);
  const urls = ["/", "/plaatsen", "/categorieen", "/nieuws", ...CATS.map(([c]) => `/categorie/${c}`)];
  for (const p of ps) { urls.push(`/plaats/${p.slug}`); for (const c of Object.keys(p.cats || {})) urls.push(`/plaats/${p.slug}/${c}`); }
  for (const b of pr) urls.push(profielUrl(b));
  for (const n of nw) urls.push(`/nieuws/${n.id}`);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.slice(0, 45000).map((x) => `<url><loc>${SITE}${esc(x)}</loc></url>`).join("")}</urlset>`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, s-maxage=3600" } });
}

async function afbeelding(id) {
  const r = await store().getWithMetadata("img/" + id, { type: "arrayBuffer" }).catch(() => null);
  if (!r?.data) return new Response("Niet gevonden", { status: 404 });
  return new Response(r.data, { headers: { "content-type": r.metadata?.type || "image/jpeg", "cache-control": "public, max-age=86400" } });
}

export default async (req) => {
  const u = new URL(req.url);
  const d = u.pathname.replace(/\/+$/, "").split("/").filter(Boolean).map(decodeURIComponent);
  try {
    if (d.length === 0) return home();
    if (d[0] === "zoeken") return zoeken(u);
    if (d[0] === "plaatsen") return plaatsenPagina();
    if (d[0] === "categorieen") return categorieenPagina();
    if (d[0] === "categorie" && d[1]) return categoriePagina(d[1]);
    if (d[0] === "plaats" && d[1]) return plaatsPagina(d[1], d[2], u);
    if (d[0] === "bedrijf" && d[2]) return bedrijfPagina(d[1], d[2]);
    if (d[0] === "nieuws" && d[1]) return berichtPagina(d[1]);
    if (d[0] === "nieuws") return nieuwsPagina(u);
    if (d[0] === "sitemap.xml") return sitemap();
    if (d[0] === "img" && d[1]) return afbeelding(d[1]);
    return nietGevonden();
  } catch (e) {
    console.error(e);
    return html(layout({ titel: "Even geduld", pad: u.pathname, body: `<section class="wrap blok"><h1>Even geduld</h1><p>Er ging iets mis bij het laden van deze pagina. Probeer het over een minuut opnieuw.</p></section>` }), 500, 0);
  }
};

export const config = { path: ["/", "/zoeken", "/plaatsen", "/categorieen", "/categorie/*", "/plaats/*", "/bedrijf/*", "/nieuws", "/nieuws/*", "/sitemap.xml", "/img/*"] };
