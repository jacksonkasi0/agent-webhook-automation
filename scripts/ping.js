const { google } = require("googleapis");
const axios = require("axios");
const path = require("path");
require("dotenv").config();

const SPREADSHEET_ID = process.env.SPREADSHEET_ID; // Your Google Spreadsheet ID
const API_KEY_FILE = path.resolve(__dirname, "../", process.env.API_KEY_FILE); // Path to your credentials.json
const URL_SHEET_RANGE = process.env.URL_SHEET_RANGE; // Range for fetching and updating websites (e.g., "Sheet1!G2:G")
const SHEET_NAME = process.env.SHEET_NAME || "Sheet1"; // Sheet name
const BATCH_SIZE = 10; // Number of rows to process in each batch

// Google Sheets API Auth
const auth = new google.auth.GoogleAuth({
  keyFile: API_KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

/**
 * Fetch rows from the specified range in Google Sheet.
 */
async function fetchRows() {
  console.log("📥 Fetching rows from Google Sheet...");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: URL_SHEET_RANGE,
  });

  const rows = response.data.values || [];
  console.log(`✅ Fetched ${rows.length} rows.`);
  return rows.map((row, index) => ({
    index: index + 2, // Adjust row index to match Google Sheet rows (starts from 2 for "G2")
    website: row[0] || "",
  }));
}

/**
 * Normalize URL to lowercase and trim whitespace.
 */
function normalizeUrl(url) {
  return url.toLowerCase().trim();
}

/**
 * Test if a URL is reachable.
 */
async function pingUrl(url) {
  try {
    await axios.get(url, { timeout: 5000 }); // 5-second timeout
    return true;
  } catch {
    return false;
  }
}

/**
 * Check all URL variants in the specified order and find the working version.
 */
async function findWorkingUrl(domain) {
  const base = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").trim();
  const variants = [
    `https://www.${base}`, // First priority
    `https://${base}`, // Second priority
    `http://www.${base}`, // Third priority
    `http://${base}`, // Fourth priority
  ];

  for (const url of variants) {
    console.log(`🔍 Testing ${url}...`);
    const isReachable = await pingUrl(url);
    if (isReachable) {
      console.log(`✅ Found working URL: ${url}`);
      return url;
    }
  }
  console.log(`❌ No working URL found for: ${domain}`);
  return null;
}

/**
 * Update the working link back into the same rows and column in Google Sheets.
 */
async function updateRows(updates) {
  console.log("🔄 Updating rows in Google Sheet...");

  const requests = updates.map((update) => ({
    range: `${SHEET_NAME}!G${update.index}:G${update.index}`, // Update the same row in column G
    values: [[update.workingLink]], // Update the cell with the working URL
  }));

  try {
    // Batch update all rows in a single request
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      resource: {
        data: requests,
        valueInputOption: "RAW",
      },
    });
    console.log("✅ Successfully updated rows.");
  } catch (error) {
    console.error("❌ Error updating rows in Google Sheet:", error.message);
  }
}

/**
 * Main function to process the sheet.
 */
async function main() {
  console.log("🚀 Starting the process...");
  const rows = await fetchRows();
  const rowsToProcess = rows.filter((row) => row.website);

  console.log(`🧐 Found ${rowsToProcess.length} rows to process.`);
  if (rowsToProcess.length === 0) {
    console.log("🎉 No rows to process.");
    return;
  }

  const updates = [];
  for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
    const batch = rowsToProcess.slice(i, i + BATCH_SIZE);
    console.log(`📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1}...`);

    for (const row of batch) {
      const normalizedUrl = normalizeUrl(row.website);
      const workingUrl = await findWorkingUrl(normalizedUrl);

      if (workingUrl) {
        // Update the original URL if the working URL is different
        updates.push({
          index: row.index,
          workingLink: workingUrl, // Update with the working URL
        });
      }
    }
  }

  if (updates.length > 0) {
    await updateRows(updates);
  } else {
    console.log("⚠️ No updates needed as no working URLs were found.");
  }

  console.log("✅ Process complete!");
}

// Run the main function
main().catch((error) => console.error("❌ Fatal Error:", error.message));