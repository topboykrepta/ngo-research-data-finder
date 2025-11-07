# 🌍 NGO & Research Data Finder (Apify Actor)

This actor automatically scrapes **open datasets** from verified NGO and government portals — starting with [OpenAFRICA](https://open.africa).

It helps NGOs, journalists, and researchers quickly discover and download clean, structured open data on topics such as:
- Climate & environment   
- Water & sanitation  
- Health & demographics   
- Energy & population 

---

##  How It Works
1. Fetches datasets from the OpenAFRICA portal.
2. Extracts dataset title, link, description, source, and last updated date.
3. Outputs results as structured JSON/CSV in Apify’s dataset.

---

##  Tech Stack
- Node.js + Apify SDK  
- Axios + Cheerio for scraping  
- JSON/CSV export support  

---

## Setup

```bash
npm install
npm start

## Output Example
{
  "title": "Kenya Water Quality Dataset 2024",
  "description": "Data on water sources across Kenya regions.",
  "link": "https://open.africa/dataset/kenya-water-quality",
  "source": "OpenAFRICA",
  "region": "Africa",
  "last_updated": "2024-06-15"

  Made by Adrian Charles
GitHub: @topboykrepta

yaml


---

###  Now do this:

1. Create the folder `ngo-research-data-finder`
2. Copy the four files above into it.
3. Run:
   ```bash
   npm install
   npm start

##  Test it locally, then:

git init
git add .
git commit -m "Initial Apify actor for NGO & Research Data Finder"
git branch -M main
git remote add origin https://github.com/topboykrepta/ngo-research-data-finder.git
git push -u origin main
