/* Start elk uur de achtergrond-import (die mag langer duren dan een geplande functie). */
export default async () => {
  const base = process.env.URL || "https://degidsvan.nl";
  const r = await fetch(base + "/.netlify/functions/importeer-background", { method: "POST", headers: { "x-import-key": process.env.IMPORT_KEY || process.env.ADMIN_KEY || "" } });
  console.log("import gestart", r.status);
  return new Response("ok");
};

export const config = { schedule: "41 * * * *" };
