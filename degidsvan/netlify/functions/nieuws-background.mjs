import { haalNieuws } from "../../src/nieuws-bron.mjs";
import { schrijf } from "../../src/gids.mjs";

export default async (req) => {
  const sleutel = process.env.IMPORT_KEY || process.env.ADMIN_KEY;
  if (!sleutel || req.headers.get("x-import-key") !== sleutel) { console.log("nieuws: geen toegang"); return new Response("nee", { status: 403 }); }
  console.log("nieuws: start");
  try {
    const r = await haalNieuws();
    console.log("nieuws " + JSON.stringify(r));
  } catch (e) {
    console.log("nieuws FOUT " + (e && e.stack || e));
    await schrijf("nieuws-log", { tijd: new Date().toISOString(), log: ["FOUT: " + String(e && e.message || e)] }).catch(() => {});
  }
};
