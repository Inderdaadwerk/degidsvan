import { haalNieuws } from "../../src/nieuws-bron.mjs";

export default async (req) => {
  const sleutel = process.env.IMPORT_KEY || process.env.ADMIN_KEY;
  if (!sleutel || req.headers.get("x-import-key") !== sleutel) return new Response("nee", { status: 403 });
  const r = await haalNieuws();
  console.log("nieuws", JSON.stringify(r));
};
