import { Actor } from "apify";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";

await Actor.init();

const BASE_URL = "https://open.africa/dataset";
console.log("🌍 Starting NGO & Research Data Finder...");

try {
    const { data } = await axios.get(BASE_URL);
    const $ = cheerio.load(data);
    const datasets = [];

    $(".dataset-item").each((_, el) => {
        const title = $(el).find(".dataset-heading a").text().trim();
        const link = "https://open.africa" + $(el).find(".dataset-heading a").attr("href");
        const description = $(el).find(".notes").text().trim();
        const updated = $(el).find(".dataset-resources .muted").first().text().trim();

        datasets.push({
            title,
            description,
            link,
            source: "OpenAFRICA",
            region: "Africa",
            last_updated: updated || "Unknown",
        });
    });

    // ✅ Save locally
    fs.writeFileSync("datasets.json", JSON.stringify(datasets, null, 2));
    console.log(`💾 Saved ${datasets.length} records to datasets.json`);

    await Actor.pushData(datasets);
    console.log(`✅ Successfully scraped ${datasets.length} datasets.`);
} catch (err) {
    console.error("❌ Error while scraping:", err.message);
}

await Actor.exit();

import Papa from "papaparse";
import fs from "fs";

// After scraping datasets[]
const csv = Papa.unparse(datasets);
fs.writeFileSync("datasets.csv", csv);
console.log(`💾 Saved ${datasets.length} records to datasets.csv`);
