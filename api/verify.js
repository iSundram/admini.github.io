// api/verify.js
import fetch from "node-fetch";

export default async function handler(req, res) {
    const { licenseKey } = req.query;

    if (!licenseKey) {
        return res.status(400).json({ error: "License key required" });
    }

    const API = process.env.API; // Vercel environment variable
    const PRODUCT_ID = process.env.PRODUCT_ID; // Vercel environment variable

    try {
        const url = `https://api.cryptolens.io/api/key/GetKey?token=${API}&ProductId=${PRODUCT_ID}&Key=${encodeURIComponent(licenseKey)}&Sign=True`;
        
        const cryptolensRes = await fetch(url);
        const data = await cryptolensRes.json();

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error contacting Cryptolens" });
    }
}
