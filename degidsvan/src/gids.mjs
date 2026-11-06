import { getStore } from "@netlify/blobs";

export const store = () => getStore({ name: "gids", consistency: "strong" });

export const slug = (s) => String(s || "").toLowerCase()
  .normalize("NFD").replace(/[̀-ͯ]/g, "")
  .replace(/&/g, " en ").replace(/'/g, "")
  .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* Categorieën: slug -> [naam meervoud, naam enkelvoud, icoon-key, OSM-matchers] */
export const CATS = [
  ["bakkers", "Bakkerij", "brood", [["shop", "bakery"], ["shop", "pastry"], ["shop", "confectionery"]]],
  ["kappers", "Kapper", "schaar", [["shop", "hairdresser"], ["shop", "barber"]]],
  ["schoonheidssalons", "Schoonheidssalon", "ster", [["shop", "beauty"], ["shop", "cosmetics"], ["shop", "massage"], ["shop", "tattoo"]]],
  ["restaurants", "Restaurant", "bord", [["amenity", "restaurant"]]],
  ["cafes", "Café", "kop", [["amenity", "cafe"], ["amenity", "bar"], ["amenity", "pub"]]],
  ["snackbars", "Snackbar", "bord", [["amenity", "fast_food"], ["amenity", "ice_cream"]]],
  ["supermarkten", "Supermarkt", "kar", [["shop", "supermarket"], ["shop", "convenience"], ["shop", "greengrocer"], ["shop", "deli"]]],
  ["slagers", "Slagerij", "kar", [["shop", "butcher"], ["shop", "seafood"], ["shop", "cheese"]]],
  ["bloemisten", "Bloemist", "bloem", [["shop", "florist"], ["shop", "garden_centre"]]],
  ["fietsenwinkels", "Fietsenwinkel", "fiets", [["shop", "bicycle"]]],
  ["autogarages", "Autogarage", "auto", [["shop", "car_repair"], ["shop", "car"], ["shop", "tyres"], ["shop", "car_parts"], ["amenity", "car_wash"]]],
  ["installateurs", "Installateur", "bliksem", [["craft", "plumber"], ["craft", "electrician"], ["craft", "hvac"], ["craft", "heating_engineer"], ["craft", "electronics_repair"]]],
  ["schilders", "Schilder", "kwast", [["craft", "painter"]]],
  ["bouwbedrijven", "Bouwbedrijf", "huis", [["craft", "carpenter"], ["craft", "builder"], ["craft", "roofer"], ["craft", "tiler"], ["craft", "plasterer"], ["craft", "glaziery"], ["craft", "stonemason"], ["craft", "window_construction"], ["office", "construction_company"], ["craft", "joiner"]]],
  ["hoveniers", "Hovenier", "blad", [["craft", "gardener"], ["craft", "landscaper"]]],
  ["schoonmaakbedrijven", "Schoonmaakbedrijf", "ster", [["craft", "cleaning"], ["shop", "dry_cleaning"], ["shop", "laundry"]]],
  ["makelaars", "Makelaar", "huis", [["office", "estate_agent"]]],
  ["accountants", "Accountant", "doc", [["office", "accountant"], ["office", "tax_advisor"], ["office", "financial"], ["office", "financial_advisor"]]],
  ["advocaten", "Advocaat", "doc", [["office", "lawyer"], ["office", "notary"]]],
  ["verzekeringen", "Verzekeringen", "schild", [["office", "insurance"]]],
  ["tandartsen", "Tandarts", "plus", [["amenity", "dentist"], ["healthcare", "dentist"]]],
  ["huisartsen", "Huisarts", "plus", [["amenity", "doctors"], ["healthcare", "doctor"]]],
  ["fysiotherapeuten", "Fysiotherapie", "plus", [["healthcare", "physiotherapist"], ["healthcare", "alternative"], ["healthcare", "psychotherapist"], ["healthcare", "podiatrist"]]],
  ["apotheken", "Apotheek", "plus", [["amenity", "pharmacy"], ["shop", "chemist"]]],
  ["dierenartsen", "Dierenarts", "poot", [["amenity", "veterinary"], ["shop", "pet"], ["shop", "pet_grooming"]]],
  ["rijscholen", "Rijschool", "auto", [["amenity", "driving_school"], ["shop", "driving_school"]]],
  ["opticiens", "Opticien", "oog", [["shop", "optician"], ["shop", "hearing_aids"]]],
  ["kledingwinkels", "Kledingwinkel", "tas", [["shop", "clothes"], ["shop", "shoes"], ["shop", "boutique"], ["shop", "fashion_accessories"], ["shop", "bag"], ["shop", "tailor"], ["craft", "tailor"]]],
  ["juweliers", "Juwelier", "ster", [["shop", "jewelry"], ["shop", "watches"]]],
  ["woonwinkels", "Woonwinkel", "huis", [["shop", "furniture"], ["shop", "interior_decoration"], ["shop", "curtain"], ["shop", "flooring"], ["shop", "kitchen"], ["shop", "bed"], ["shop", "lighting"], ["shop", "houseware"]]],
  ["bouwmarkten", "Bouwmarkt", "huis", [["shop", "doityourself"], ["shop", "hardware"], ["shop", "paint"], ["shop", "trade"]]],
  ["elektronicawinkels", "Elektronica", "bliksem", [["shop", "electronics"], ["shop", "mobile_phone"], ["shop", "computer"]]],
  ["hotels", "Hotel", "bed", [["tourism", "hotel"], ["tourism", "guest_house"], ["tourism", "motel"]]],
  ["sportscholen", "Sportschool", "hart", [["leisure", "fitness_centre"], ["leisure", "sports_centre"], ["shop", "sports"]]],
  ["drukkerijen", "Drukkerij", "doc", [["craft", "printer"], ["shop", "copyshop"], ["craft", "sign_maker"]]],
  ["fotografen", "Fotograaf", "oog", [["craft", "photographer"], ["shop", "photo"]]],
  ["it-bedrijven", "IT-bedrijf", "scherm", [["office", "it"], ["office", "telecommunication"]]],
  ["reisbureaus", "Reisbureau", "koffer", [["shop", "travel_agency"], ["office", "travel_agent"]]],
  ["uitzendbureaus", "Uitzendbureau", "mensen", [["office", "employment_agency"]]],
  ["architecten", "Architect", "huis", [["office", "architect"]]],
  ["winkels", "Winkel", "tas", [["shop", "*"]]],
  ["vakmensen", "Vakman", "kwast", [["craft", "*"]]],
  ["kantoren", "Zakelijke dienst", "doc", [["office", "*"]]]
];
const MEERVOUD = { cafes: "cafés", "it-bedrijven": "IT-bedrijven", kantoren: "zakelijke diensten", vakmensen: "vakmensen", winkels: "winkels" };
export const CAT = Object.fromEntries(CATS.map(([s, ev, ic]) => [s, { slug: s, naam: MEERVOUD[s] || s.replace(/-/g, " "), enkel: ev, icoon: ic }]));
export const catNaam = (s) => (CAT[s] ? CAT[s].naam.charAt(0).toUpperCase() + CAT[s].naam.slice(1) : "Bedrijven");

export function categorie(tags) {
  for (const [s, , , matchers] of CATS) {
    for (const [k, v] of matchers) {
      if (tags[k] && (v === "*" || tags[k] === v)) return s;
    }
  }
  return null;
}

/* Gemeenten die de import rouleert (naam zoals in OpenStreetMap) */
export const GEMEENTEN = ["Amsterdam","Rotterdam","'s-Gravenhage","Utrecht","Eindhoven","Groningen","Tilburg","Almere","Breda","Nijmegen","Apeldoorn","Arnhem","Haarlem","Haarlemmermeer","Amersfoort","Zaanstad","Enschede","'s-Hertogenbosch","Zwolle","Zoetermeer","Leeuwarden","Leiden","Maastricht","Dordrecht","Ede","Alphen aan den Rijn","Alkmaar","Westland","Emmen","Delft","Venlo","Deventer","Sittard-Geleen","Helmond","Oss","Amstelveen","Hilversum","Súdwest-Fryslân","Heerlen","Hengelo","Purmerend","Schiedam","Lelystad","Roosendaal","Leidschendam-Voorburg","Gouda","Hoorn","Almelo","Vlaardingen","Velsen","Assen","Capelle aan den IJssel","Bergen op Zoom","Veenendaal","Katwijk","Zeist","Nieuwegein","Roermond","Den Helder","Doetinchem","Hoogeveen","Terneuzen","Kampen","Woerden","Houten","Middelburg","Vlissingen","Harderwijk","Barneveld","Dijk en Waard","Wageningen","Tiel","Zutphen","Weert","Meppel","Smallingerland","Heerenveen","Gorinchem","Waalwijk","Meierijstad","Oosterhout","Hardenberg","Zwijndrecht","Ridderkerk","Nissewaard","Lansingerland","Pijnacker-Nootdorp","Rijswijk","Wassenaar","Noordwijk","Bodegraven-Reeuwijk","Soest","Baarn","Gooise Meren","Huizen","Diemen","Ouder-Amstel","Uithoorn","Aalsmeer","Heemstede","Bloemendaal","Beverwijk","Heemskerk","Castricum","Bergen (NH)","Schagen","Enkhuizen","Medemblik","Edam-Volendam","Waterland"];
export const gemeenteSlug = (g) => slug(g === "'s-Gravenhage" ? "Den Haag" : g === "'s-Hertogenbosch" ? "Den Bosch" : g.replace(/ \(NH\)$/, ""));
export const gemeenteNaam = (g) => (g === "'s-Gravenhage" ? "Den Haag" : g === "'s-Hertogenbosch" ? "'s-Hertogenbosch" : g.replace(/ \(NH\)$/, ""));

export async function lees(key, standaard) {
  try { const v = await store().get(key, { type: "json" }); return v ?? standaard; } catch { return standaard; }
}
export async function schrijf(key, v) { await store().setJSON(key, v); }

export async function plaatsen() { return lees("plaatsen", []); } /* [{slug,naam,aantal,bijgewerkt}] */
export async function plaats(s) { return lees("plaats/" + s, null); }
export async function profielen() { return lees("profielen", []); } /* betaalde profielen */
export async function nieuws() { return lees("nieuws", []); }
export async function verwijderd() { return lees("verwijderd", []); }

export function profielUrl(b) { return `/bedrijf/${b.plaats}/${b.id}-${slug(b.naam)}`; }
