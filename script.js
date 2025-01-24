const path = require("path");

const { google } = require("googleapis");
const axios = require("axios");
require("dotenv").config();

// Constants from .env file
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const API_KEY_FILE = path.resolve(__dirname, process.env.API_KEY_FILE);
const AGENT_WEBHOOK_URL = process.env.AGENT_WEBHOOK_URL;
const SHEET_RANGE = process.env.SHEET_RANGE; // Example: "Sheet1!A2:AE" for 31 columns
const SHEET_NAME = process.env.SHEET_NAME; // Example: "Sheet1"
const BATCH_SIZE = 5; // Number of rows to process in each batch

// Load Google Sheets API credentials
const auth = new google.auth.GoogleAuth({
  keyFile: API_KEY_FILE,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});
const sheets = google.sheets({ version: "v4", auth });

// Function to fetch rows from the Google Sheet
async function fetchRows() {
  console.log("📥 Fetching rows from the Google Sheet...");
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: SHEET_RANGE,
  });

  const rows = response.data.values || [];
  console.log(`✅ Successfully fetched ${rows.length} rows.`);
  return rows.map((row, index) => ({
    index: index + 2, // Adjust to match Google Sheet row number
    Fname: row[0],
    Lname: row[1],
    Title: row[2],
    Company: row[3],
    Emp: row[4],
    Email: row[5],
    Website: row[6],
    Competitors: row[7],
    SpecificResult: row[8],
    SpecificBenefit: row[9],
    PainPoints: row[10],
    Feedback: row[11],
    Feedback1: row[12],
    Feedback2: row[13],
    Feedback3: row[14], // Column O
    Country: row[15],
  }));
}

// Function to send data to the Agent webhook
async function processWebsite(website) {
  // NOTE: run the ping.js no need to normalize the website URL here

  const normalizedUrl = new URL(website).href; // Ensure proper formatting

  console.log(`🌐 Sending website URL (${normalizedUrl}) to the agent webhook...`);
  try
  {
    const response = await axios.post(
      AGENT_WEBHOOK_URL,
      { client_website: normalizedUrl },
      {
        headers: { "Content-Type": "application/json" },
      },
    );

    console.log(`✅ Successfully processed website: ${website}`);

    if (response.data.error) {
      console.error(
        `❌ Error processing website (${website}):`,
        response.data.error,
      );
      return null;
    }

    // Extract `feedback_points` directly (as it is already an array of strings)
    const feedbackPoints =
      response.data.response.response.feedback_points || [];

    // Return structured response
    return {
      ...response.data.response.response,
      feedback_points: feedbackPoints, // Use the feedback points directly
    };
  } catch (error) {
    console.error(`❌ Error processing website (${website}):`, error.message);
    return null;
  }
}

// Function to update rows in the Google Sheet
async function updateRows(updates) {
  console.log("🔄 Updating rows in the Google Sheet...");
  const values = updates.map((update) => [
    update.Competitors,
    // remove dot from the result
    update.SpecificResult.replace(/\.$/, ""),
    update.SpecificBenefit.replace(/\.$/, ""),
    update.PainPoints,
    update.Feedback,
    update.Feedback1,
    update.Feedback2,
    update.Feedback3,
  ]);

  const startRow = updates[0].index;
  const endRow = updates[updates.length - 1].index;
  const range = `${SHEET_NAME}!H${startRow}:O${endRow}`; // Columns H to O for Competitors to Feedback 3

  try {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range,
      valueInputOption: "RAW",
      resource: { values },
    });
    console.log(`✅ Successfully updated rows ${startRow} to ${endRow}.`);
  } catch (error) {
    console.error("❌ Error updating rows in the Google Sheet:", error.message);
  }
}

// Main processing function
async function main() {
  console.log("🚀 Starting the main processing function...");
  const rows = await fetchRows();
  const rowsToProcess = rows.filter((row) => !row.Competitors && row.Website);

  console.log(`🧐 Found ${rowsToProcess.length} rows to process.`);
  if (rowsToProcess.length === 0) {
    console.log("🎉 All rows are already processed. No action required.");
    return;
  }

  for (let i = 0; i < rowsToProcess.length; i += BATCH_SIZE) {
    const batch = rowsToProcess.slice(i, i + BATCH_SIZE);
    console.log(
      `📦 Processing batch ${Math.floor(i / BATCH_SIZE) + 1} (${
        batch.length
      } rows)...`,
    );

    const updates = [];
    await Promise.all(
      batch.map(async (row) => {
        const agentResponse = await processWebsite(row.Website);
        if (agentResponse) {
          console.log(`🔍 Agent response:`, agentResponse);
          updates.push({
            index: row.index,
            Competitors: agentResponse.competitors || "",
            SpecificResult: agentResponse.result_benefit?.result || "",
            SpecificBenefit: agentResponse.result_benefit?.benefit || "",
            Feedback: agentResponse.feedback_title || "",
            // Directly access the array returned by processWebsite()
            Feedback1: agentResponse.feedback_points?.[0] || "",
            Feedback2: agentResponse.feedback_points?.[1] || "",
            Feedback3: agentResponse.feedback_points?.[2] || "",
            // Pain points
            PainPoints: agentResponse.pain_points || "",
          });
        }
      }),
    );

    if (updates.length > 0) {
      console.log(
        `📋 Preparing to update rows ${updates[0].index} to ${
          updates[updates.length - 1].index
        }...`,
      );
      await updateRows(updates);
    } else {
      console.log("⚠️ No updates to process in this batch.");
    }
  }
  console.log("✅ Processing complete. All rows updated.");
}

// Run the main function
main().catch((error) => console.error("❌ Fatal Error:", error.message));
