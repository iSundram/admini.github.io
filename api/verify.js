// api/verify.js
export default async function handler(req, res) {
  const licenseKey = req.query.licenseKey || req.query.key;
  if (!licenseKey) {
    return res.status(400).json({ error: "License key required" });
  }

  const API = process.env.API;
  const PRODUCT_ID = process.env.PRODUCT_ID;

  if (!API || !PRODUCT_ID) {
    return res.status(500).json({
      error: "Server misconfigured: missing API or PRODUCT_ID env variables"
    });
  }

  const url = `https://api.cryptolens.io/api/key/GetKey?token=${encodeURIComponent(API)}&ProductId=${encodeURIComponent(PRODUCT_ID)}&Key=${encodeURIComponent(licenseKey)}&Sign=True`;

  try {
    const resp = await fetch(url, { method: "GET" });
    const text = await resp.text();

    let payload;
    try {
      payload = JSON.parse(text);
    } catch (parseErr) {
      // Cryptolens should return JSON, but handle it gracefully
      return res.status(502).json({
        error: "Invalid response from Cryptolens (non-JSON)",
        status: resp.status,
        body: text
      });
    }

    // Forward cryptolens payload but include metadata so frontend can show the exact error/status
    return res.status(200).json({
      ok: true,
      status: resp.status,
      cryptolens: payload
    });
  } catch (err) {
    console.error("verify error:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message
    });
  }
}
