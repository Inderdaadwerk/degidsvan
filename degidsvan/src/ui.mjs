import { CATS, CAT, catNaam, esc, profielUrl } from "./gids.mjs";

export const SITE = "https://degidsvan.nl";

const IC = {
  brood: '<path d="M4 13c0-4 4-7 8-7s8 3 8 7v5H4z"/><path d="M8 10v3M12 9v4M16 10v3"/>',
  schaar: '<circle cx="6" cy="18" r="3"/><circle cx="18" cy="18" r="3"/><path d="M8 16 19 4M16 16 5 4"/>',
  ster: '<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6-5.3-3-5.3 3 1.2-6L3.4 9.3l6-.7z"/>',
  bord: '<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>',
  kop: '<path d="M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M7 3v2M11 3v2"/>',
  kar: '<path d="M3 4h2l2.5 11h11L21 7H6.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
  bloem: '<circle cx="12" cy="9" r="2.5"/><path d="M12 6.5a3 3 0 1 1 2.6 4M12 6.5a3 3 0 1 0-2.6 4M14.6 10.5a3 3 0 1 1-5.2 0M12 11.5V21M12 17c-2 0-4-1-5-3M12 17c2 0 4-1 5-3"/>',
  fiets: '<circle cx="6" cy="16" r="3.5"/><circle cx="18" cy="16" r="3.5"/><path d="M6 16l4-7h5l3 7M10 9 8 5H6M14 6h2"/>',
  auto: '<path d="M4 16v-4l2-5h12l2 5v4zM4 16v2M20 16v2M4 12h16"/><circle cx="8" cy="14" r="1"/><circle cx="16" cy="14" r="1"/>',
  bliksem: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
  kwast: '<path d="M4 4h12v5H4zM16 6h3v5h-7v3M11 14h2v7h-2z"/>',
  huis: '<path d="M3 11 12 4l9 7M5 10v10h14V10M10 20v-6h4v6"/>',
  blad: '<path d="M5 19c0-9 6-14 15-14 0 9-5 15-14 15zM5 19l8-8"/>',
  doc: '<path d="M6 3h9l4 4v14H6zM14 3v5h5M9 12h7M9 16h7"/>',
  schild: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  plus: '<rect x="3" y="3" width="18" height="18" rx="4"/><path d="M12 8v8M8 12h8"/>',
  poot: '<circle cx="7" cy="9" r="1.8"/><circle cx="11" cy="6" r="1.8"/><circle cx="15" cy="6" r="1.8"/><circle cx="18" cy="9.5" r="1.8"/><path d="M8 17c0-3 2-5 4-5s4 2 4 5c0 2-2 3-4 2-2 1-4 0-4-2z"/>',
  oog: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  tas: '<path d="M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  bed: '<path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-8v1"/><circle cx="7" cy="10.5" r="1.8"/>',
  hart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  scherm: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
  koffer: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5h6v2M3 13h18"/>',
  mensen: '<circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.5 2.7-6 6-6s6 2.5 6 6M16 5a3 3 0 0 1 0 6M21 20c0-3-1.7-5.3-4-6"/>'
};
export const icoon = (k, cls = "ic") => `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k] || IC.doc}</svg>`;

export const LOGO = `<svg viewBox="0 0 48 48" class="logo-ic" aria-hidden="true"><rect width="48" height="48" rx="13" fill="#0f4c5c"/><path d="M12 15c4-1.6 8-1.2 12 1.4 4-2.6 8-3 12-1.4v19c-4-1.6-8-1.2-12 1.4-4-2.6-8-3-12-1.4z" fill="#fff"/><path d="M24 16.4v19" stroke="#0f4c5c" stroke-width="2"/><circle cx="35" cy="14" r="5.5" fill="#ffc845"/></svg>`;

export const TOPCATS = ["kappers","restaurants","installateurs","autogarages","bakkers","schoonheidssalons","makelaars","accountants","bouwbedrijven","fysiotherapeuten","schilders","hoveniers"];

export function layout({ titel, omschrijving, pad, body, home = false, zoek = { wat: "", waar: "" }, jsonld = "" }) {
  const t = titel ? `${esc(titel)} | De Gids Van` : "De Gids Van – vind bedrijven bij u in de buurt";
  return `<!doctype html>
<html lang="nl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${t}</title>
<meta name="description" content="${esc(omschrijving || "Zoek en vind lokale bedrijven, winkels en vakmensen in uw regio in De Gids Van.")}">
<link rel="canonical" href="${SITE}${esc(pad || "/")}">
<link rel="icon" href="/logo.svg" type="image/svg+xml">
<link rel="stylesheet" href="/gids.css?v=1">
<meta property="og:title" content="${t}">
<meta property="og:type" content="website">
<meta property="og:url" content="${SITE}${esc(pad || "/")}">
${jsonld}
</head>
<body${home ? ' class="home"' : ""}>
<a class="skip" href="#inhoud">Naar inhoud</a>
<header class="kop">
  <div class="wrap kop-in">
    <a class="logo" href="/" aria-label="De Gids Van, home">${LOGO}<span>de gids <b>van</b></span></a>
    ${home ? "" : `<form class="mini-zoek" action="/zoeken" role="search"><input name="wat" value="${esc(zoek.wat)}" placeholder="Wat zoekt u?" aria-label="Wat zoekt u"><input name="waar" value="${esc(zoek.waar)}" placeholder="Plaats" aria-label="Plaats" list="dl-plaatsen"><button aria-label="Zoeken"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg></button></form>`}
    <button class="menu-k" aria-label="Menu" aria-expanded="false" onclick="this.parentNode.classList.toggle('open');this.setAttribute('aria-expanded',this.parentNode.classList.contains('open'))"><i></i><i></i><i></i></button>
    <nav class="hoofdnav">
      <a href="/plaatsen">Plaatsen</a>
      <a href="/categorieen">Categorieën</a>
      <a href="/nieuws">Nieuws</a>
      <a class="knop klein" href="/aanmelden.html">Bedrijf aanmelden</a>
    </nav>
  </div>
</header>
<main id="inhoud">
${body}
</main>
${voet()}
</body>
</html>`;
}

export function voet() {
  return `<footer class="voet">
  <div class="wrap voet-in">
    <div>
      <a class="logo licht" href="/">${LOGO}<span>de gids <b>van</b></span></a>
      <p>De gids voor lokale bedrijven, winkels en vakmensen in heel Nederland.</p>
    </div>
    <div><h3>Populair</h3>${TOPCATS.slice(0, 6).map((c) => `<a href="/categorie/${c}">${esc(catNaam(c))}</a>`).join("")}</div>
    <div><h3>Voor bedrijven</h3><a href="/aanmelden.html">Bedrijf aanmelden</a><a href="/wijzigen.html">Vermelding wijzigen of verwijderen</a><a href="/contact.html">Contact</a></div>
    <div><h3>Informatie</h3><a href="/over-ons.html">Over De Gids Van</a><a href="/privacy.html">Privacy</a><a href="/disclaimer.html">Disclaimer</a><a href="/voorwaarden.html">Voorwaarden</a></div>
  </div>
  <div class="wrap voet-onder">
    <span>© ${new Date().getFullYear()} De Gids Van</span>
    <span>Basisgegevens: © <a href="https://www.openstreetmap.org/copyright" rel="noopener">OpenStreetMap-bijdragers</a> (ODbL). Nieuws: Rijksoverheid (CC0).</span>
  </div>
</footer>`;
}

export function zoekHero(plaatsen, aantal) {
  return `<section class="held">
  <div class="wrap">
    <h1>Vind een bedrijf<br>bij u in de buurt.</h1>
    <p class="held-p">${aantal ? `${aantal.toLocaleString("nl-NL")} bedrijven, winkels en vakmensen in ${plaatsen.length} plaatsen.` : "Bedrijven, winkels en vakmensen in heel Nederland."}</p>
    <form class="zoek" action="/zoeken" role="search">
      <label><span>Wat</span><input name="wat" placeholder="Bijv. kapper, bakker of bedrijfsnaam" list="dl-cats" autocomplete="off"></label>
      <label><span>Waar</span><input name="waar" placeholder="Plaats" list="dl-plaatsen" autocomplete="off"></label>
      <button class="knop groot">Zoeken</button>
    </form>
    <div class="chips">${TOPCATS.slice(0, 6).map((c) => `<a href="/categorie/${c}">${esc(catNaam(c))}</a>`).join("")}</div>
  </div>
</section>
${datalists(plaatsen)}`;
}

export function datalists(plaatsen) {
  return `<datalist id="dl-plaatsen">${plaatsen.map((p) => `<option value="${esc(p.naam)}">`).join("")}</datalist>
<datalist id="dl-cats">${CATS.filter(([s]) => !["winkels","vakmensen","kantoren"].includes(s)).map(([s]) => `<option value="${esc(catNaam(s))}">`).join("")}</datalist>`;
}

export function adresRegel(b) {
  const straat = [b.straat, b.nr].filter(Boolean).join(" ");
  const plaats = [b.pc, b.woonplaats].filter(Boolean).join(" ");
  return [straat, plaats].filter(Boolean).join(", ");
}

export function kaart(b, plaatsNaam) {
  const betaald = b.betaald;
  const cat = CAT[b.cat];
  return `<article class="kaart${betaald ? " betaald" : ""}${b.uitgelicht ? " uit" : ""}">
  ${betaald && b.logo ? `<img class="k-logo" src="${esc(b.logo)}" alt="" loading="lazy">` : `<span class="k-ic">${icoon(cat?.icoon || "doc")}</span>`}
  <div class="k-txt">
    <h3><a href="${profielUrl(b)}">${esc(b.naam)}</a>${betaald ? ' <span class="badge" title="Geverifieerd profiel">✓</span>' : ""}</h3>
    <p class="k-cat">${esc(cat?.enkel || "Bedrijf")}${plaatsNaam ? ` in ${esc(b.woonplaats || plaatsNaam)}` : ""}</p>
    ${adresRegel(b) ? `<p class="k-adr">${esc(adresRegel(b))}</p>` : ""}
    ${betaald && b.kort ? `<p class="k-kort">${esc(b.kort)}</p>` : ""}
  </div>
  <div class="k-acties">
    ${b.tel ? `<a class="knop klein licht" href="tel:${esc(b.tel.replace(/[^+\d]/g, ""))}">Bellen</a>` : ""}
    <a class="knop klein" href="${profielUrl(b)}">Bekijk</a>
  </div>
</article>`;
}

export function pager(pagina, totaal, per, basis) {
  const n = Math.ceil(totaal / per);
  if (n <= 1) return "";
  const link = (p) => basis + (basis.includes("?") ? "&" : "?") + "p=" + p;
  let h = '<nav class="pager" aria-label="Pagina\'s">';
  if (pagina > 1) h += `<a href="${link(pagina - 1)}">← Vorige</a>`;
  h += `<span>Pagina ${pagina} van ${n}</span>`;
  if (pagina < n) h += `<a href="${link(pagina + 1)}">Volgende →</a>`;
  return h + "</nav>";
}

export const datumNL = (iso) => new Date(iso).toLocaleDateString("nl-NL", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Amsterdam" });

const DAGEN = { Mo: "ma", Tu: "di", We: "wo", Th: "do", Fr: "vr", Sa: "za", Su: "zo", PH: "feestdagen", off: "gesloten" };
export function openNL(s) {
  if (!s) return "";
  return String(s).replace(/\b(Mo|Tu|We|Th|Fr|Sa|Su|PH|off)\b/g, (m) => DAGEN[m]).replace(/;\s*/g, "\n").replace(/,/g, ", ");
}

export function kruimel(items) {
  return `<nav class="kruimel" aria-label="Kruimelpad"><a href="/">Home</a>${items.map(([t, u]) => u ? ` <span>›</span> <a href="${u}">${esc(t)}</a>` : ` <span>›</span> <span aria-current="page">${esc(t)}</span>`).join("")}</nav>`;
}

/* Nieuwsbeeld: echte foto (Pexels) of een eigen illustratie per thema */
import { thema } from "./nieuws-bron.mjs";
const PAL = { belasting: ["#0f4c5c", "#2a7f8f", "doc"], loon: ["#1e6b4c", "#3fa577", "mensen"], energie: ["#c77a00", "#ffc845", "bliksem"], geld: ["#0f4c5c", "#ffc845", "ster"], bouw: ["#a2471b", "#e88b4a", "huis"], werk: ["#1d3f8f", "#4f7be0", "mensen"], handel: ["#13232b", "#2f6f8f", "koffer"], digitaal: ["#4b2a8f", "#8a6be0", "scherm"], veilig: ["#8f1d2c", "#e0596b", "schild"], ondernemer: ["#0f4c5c", "#5fb3a6", "tas"], algemeen: ["#0a3843", "#2a7f8f", "ster"] };
export function nieuwsBeeld(n, cls = "nw-beeld", groot = false) {
  const t = thema(n)?.[1] || "algemeen", [a, b, ic] = PAL[t] || PAL.algemeen;
  const illu = (extra = "") => `<div class="${cls} nw-illu" style="background:linear-gradient(135deg,${a},${b});${extra}" aria-hidden="true">${icoon(ic, "ic")}</div>`;
  if (n.foto) return `<img class="${cls}" src="${esc(groot ? n.foto : n.fotoKlein || n.foto)}" alt="" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display=''">${illu("display:none")}`;
  return illu();
}
export const fotoCredit = (n) => n.themaFoto && !n.fotoDoor ? `<p class="foto-credit">Beeld: illustratief</p>` : n.ai ? `<p class="foto-credit">Beeld: illustratie gemaakt met AI</p>` : (n.foto && n.fotoDoor ? `<p class="foto-credit">Foto: <a href="${esc(n.fotoLink)}" rel="noopener" target="_blank">${esc(n.fotoDoor === "Pexels" ? "Pexels" : n.fotoDoor + " via Pexels")}</a> (illustratief)</p>` : "");
