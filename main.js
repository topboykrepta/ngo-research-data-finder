import { Actor } from "apify";
import axios from "axios";
import * as cheerio from "cheerio";
import fs from "fs";
import Papa from "papaparse";

await Actor.init();

// 🧠 Get input keyword
const input = await Actor.getInput();
const keyword = input?.keyword?.toLowerCase().trim() || "";

console.log(`🌍 Starting NGO & Research Data Finder (keyword: "${keyword || 'none'}")...`);

const datasets = [];

await Actor.init();

console.log("🌍 Starting NGO & Research Data Finder (multi-source)...");

const datasets = [];

/**
 * 1️⃣ Scrape OpenAFRICA
 */
async function scrapeOpenAfrica() {
    const BASE_URL = "https://open.africa/dataset";
    console.log("🔎 Scraping OpenAFRICA...");
    try {
        const { data } = await axios.get(BASE_URL);
        const $ = cheerio.load(data);

        $(".dataset-item").each((_, el) => {
            const title = $(el).find(".dataset-heading a").text().trim();
            const link = "https://open.africa" + $(el).find(".dataset-heading a").attr("href");
            const description = $(el).find(".notes").text().trim();
            const updated = $(el).find(".dataset-resources .muted").first().text().trim();

            datasets.push({
                title,
                description,
                source: "OpenAFRICA",
                category: "General",
                region: "Africa",
                last_updated: updated || "Unknown",
                download_url: link,
            });
        });

        console.log(`✅ OpenAFRICA: ${datasets.length} total so far.`);
    } catch (err) {
        console.error("❌ OpenAFRICA error:", err.message);
    }
}

/**
 * 2️⃣ Scrape World Bank Open Data
 */
async function scrapeWorldBank() {
    const API_URL = "https://api.worldbank.org/v2/indicator?format=json&page=1";
    console.log("🔎 Scraping World Bank Open Data...");
    try {
        const { data } = await axios.get(API_URL);
        if (Array.isArray(data) && data[1]) {
            for (const item of data[1]) {
                datasets.push({
                    title: item.name,
                    description: item.sourceNote || "No description",
                    source: "World Bank",
                    category: item.source.value || "Development",
                    region: "Global",
                    last_updated: "N/A",
                    download_url: `https://data.worldbank.org/indicator/${item.id}`,
                });
            }
        }
        console.log(`✅ World Bank: ${datasets.length} total so far.`);
    } catch (err) {
        console.error("❌ World Bank error:", err.message);
    }
}

/**
 * 3️⃣ Scrape UN Data (metadata level)
 */
async function scrapeUNData() {
    const BASE_URL = "https://data.un.org/en/index.html";
    console.log("🔎 Scraping UN Data...");
    try {
        const { data } = await axios.get(BASE_URL);
        const $ = cheerio.load(data);

        $(".data-links li a").each((_, el) => {
            const title = $(el).text().trim();
            const link = "https://data.un.org" + $(el).attr("href");

            datasets.push({
                title,
                description: "UN statistical dataset",
                source: "UN Data",
                category: "Global Statistics",
                region: "Global",
                last_updated: "Unknown",
                download_url: link,
            });
        });

        console.log(`✅ UN Data: ${datasets.length} total so far.`);
    } catch (err) {
        console.error("❌ UN Data error:", err.message);
    }
}

/**
 * Run all scrapers sequentially
 */
await scrapeOpenAfrica();
await scrapeWorldBank();
await scrapeUNData();

/**
 * Save output locally
 */
fs.writeFileSync("datasets.json", JSON.stringify(datasets, null, 2));
const csv = Papa.unparse(datasets);
fs.writeFileSync("datasets.csv", csv);

console.log(`💾 Saved ${datasets.length} records to datasets.json and datasets.csv`);

/**
 * Push to Apify dataset (for cloud version)
 */
await Actor.pushData(datasets);

console.log("🎉 NGO & Research Data Finder completed successfully!");
await Actor.exit();

// 🔍 Filter by keyword (if provided)
let filtered = datasets;
if (keyword) {
    filtered = datasets.filter((d) =>
        Object.values(d).some((v) =>
            v.toLowerCase().includes(keyword)
        )
    );
    console.log(`🧾 Filtered ${filtered.length} of ${datasets.length} datasets containing "${keyword}"`);
}

// 💾 Save filtered results
fs.writeFileSync("datasets.json", JSON.stringify(filtered, null, 2));
const csv = Papa.unparse(filtered);
fs.writeFileSync("datasets.csv", csv);

await Actor.pushData(filtered);

console.log(`🎉 NGO & Research Data Finder completed. Total records: ${filtered.length}`);
await Actor.exit();