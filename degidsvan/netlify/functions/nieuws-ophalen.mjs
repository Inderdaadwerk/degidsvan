/* Start elke 3 uur het ophalen van nieuws op de achtergrond (beelden maken duurt langer dan 30 seconden). */
export default async () => {
  const base = process.env.URL || "https://degidsvan.nl";
  const r = await fetch(base + "/.netlify/functions/nieuws-background", { method: "POST", headers: { "x-import-key": process.env.IMPORT_KEY || process.env.ADMIN_KEY || "" } });
  console.log("nieuws gestart", r.status);
  return new Response("ok");
};

export const config = { schedule: "17 */3 * * *" };
