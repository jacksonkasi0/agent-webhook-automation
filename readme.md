# Website Feedback Automation

This project automates the process of analyzing website data and updating Google Sheets using Node.js. It integrates with **Agent.AI** to fetch website feedback and competitor analysis through a webhook.

---

## Digram

![Agent.ai Workflow](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/pxtsm04oey4eobwgqnld.png)

## **Agents** (agent.ai)

- <https://agent.ai/agent/website_feedback_bot>
- <https://agent.ai/agent/visual-design-guru>

## **PPT**

- <https://app.pageon.ai/s/share/13245/simplified-automated-workflow-for-marketing-teams>

## **DEMO**

- <https://www.loom.com/share/7bd3c9fb7d09435589a6ceb8c14be66f?sid=0f689163-ab71-49a0-bc90-0531b7bd239e>

## **Features**

- **Google Sheets Integration**:
  - Reads website data from a Google Sheet using the `googleapis` library.
  - Updates specific columns in the sheet after processing the website feedback.

- **Agent.AI Webhook**:
  - Sends website URLs to the Agent.AI bot for analysis.
  - Receives detailed feedback, including:
    - Competitors.
    - Specific actionable feedback points.
    - Tangible benefits and results for improving the website.

- **URL Normalization**:
  - Ensures all website URLs are correctly formatted using the `normalizeDomain` utility.

- **Batch Processing**:
  - Processes websites in batches for improved efficiency.

---

## **Setup Instructions**

### 1. **Prerequisites**

#### Service Account and Google API Setup

1. **Create a Service Account**:
   - Go to the [Google Cloud Console](https://console.cloud.google.com/).
   - Create a new project (or use an existing one).
   - Navigate to **APIs & Services > Credentials**.
   - Click **Create Credentials > Service Account**.

2. **Download the Credentials**:
   - After creating the service account, download the JSON key file.
   - Save the file as `credentials.json` in the root of your project.

3. **Enable Google Sheets API**:
   - In the Google Cloud Console, go to **APIs & Services > Library**.
   - Search for **Google Sheets API** and enable it for your project.

4. **Grant Access to the Sheet**:
   - Open the Google Sheet you want to use.
   - Share the sheet with the service account email (found in the `client_email` field of the `credentials.json` file) and provide **Editor** access.

#### Example Sheet Setup

- Use the `example.csv` file included in the repository to create your sheet.
  - Upload the file to Google Sheets.
  - Ensure the columns match the script requirements.

---

### 2. **Environment Configuration**

Create a `.env` file in the root directory with the following variables:

```plaintext
SPREADSHEET_ID=<Your Google Spreadsheet ID>
API_KEY_FILE=credentials.json
AGENT_WEBHOOK_URL=https://agent.ai/agent/website_feedback_bot
SHEET_RANGE=Sheet1!A2:O  # Ensure the range matches your sheet's column structure
SHEET_NAME=Sheet1        # Name of the Google Sheet tab
```

---

### 3. **Install Dependencies**

Install required packages by running:

```bash
pnpm install
```

---

### 4. **Run the Script**

Execute the script with:

```bash
node script.js
```

---

## **Code Overview**

### **Key Components**

1. **Google Sheets API Integration**:
   - Reads data from the spreadsheet using the Google Sheets API.
   - Updates processed rows back into the sheet.

2. **Agent.AI Webhook**:
   - Sends website URLs for analysis and retrieves:
     - Competitor names.
     - Specific actionable feedback.
     - Results and benefits.

3. **URL Normalization Utility**:
   - Converts any given domain or URL into a standard format (`https://www.example.com`).

4. **Batch Processing**:
   - Processes rows in batches of 10 (or as configured in the `.env` file).

---

## **Folder Structure**

```plaintext
.
├── .env                # Environment configuration file
├── script.js           # Main script for automation
├── utils
│   └── normalizeDomain.js # Utility to normalize website URLs
├── example.csv         # Sample sheet for testing
├── package.json        # Project metadata and dependencies
├── README.md           # Documentation
└── credentials.json    # Google API credentials (add your credentials file)
```

---

## **Key Functions**

1. **`fetchRows`**:
   - Fetches rows from the specified Google Sheet range.

2. **`processWebsite`**:
   - Normalizes the domain using `normalizeDomain`.
   - Sends the URL to the Agent.AI webhook for feedback and analysis.

3. **`updateRows`**:
   - Updates the sheet with the processed data:
     - Competitors.
     - Feedback points.
     - Results and benefits.

4. **`normalizeDomain`**:
   - Converts various URL formats into a standardized format (`https://www.example.com`).

5. **`main`**:
   - Orchestrates the entire flow:
     - Fetches rows.
     - Processes each website.
     - Updates the Google Sheet with feedback.

---

## **Dependencies**

- **`googleapis`**:
  - For accessing and updating Google Sheets.

- **`axios`**:
  - For making HTTP requests to the Agent.AI webhook.

- **`dotenv`**:
  - For managing environment variables.

---

## **Example Output in Google Sheet**

| Competitors         | Specific Result                                  | Specific Benefit                  | Feedback 1                                    | Feedback 2                               | Feedback 3                              |
|---------------------|--------------------------------------------------|-----------------------------------|----------------------------------------------|------------------------------------------|-----------------------------------------|
| FutureTech, Innovate| modernized design, improved navigation           | a website that builds trust       | Improve navigation                           | Enhance visual appeal                    | Strengthen CTAs                         |

---

## **Contributing**

Feel free to contribute by submitting a pull request or suggesting improvements in the issues section.

---

## **License**

This project is licensed under the MIT License.
