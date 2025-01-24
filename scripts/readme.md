# **Ping and Update Google Sheet URLs**

This script processes a column of URLs from a Google Sheet, validates them by pinging multiple variants of each URL, and updates the working URL back into the same column of the sheet.

---

## **Features**

- **Fetch URLs from Google Sheets**:
  - Retrieves URLs from a specified column (e.g., column `G`) in a Google Sheet.
  
- **URL Normalization**:
  - Standardizes URLs to lowercase and trims any extra spaces.

- **Ping URL Variants**:
  - Tests various URL formats for each domain to determine which version works:
    - `https://example.com`
    - `http://example.com`
    - `https://www.example.com`
    - `http://www.example.com`

- **Batch Processing**:
  - Processes rows in configurable batch sizes for efficiency.

- **Google Sheets Update**:
  - Updates the validated working URL back into the same column of the sheet.

---

## **Setup Instructions**

### **1. Environment Configuration**
Create a `.env` file in the root directory with the following variables:

```plaintext
SPREADSHEET_ID=<Your Google Spreadsheet ID>
API_KEY_FILE=credentials.json
URL_SHEET_RANGE=Sheet1!G2:G
SHEET_NAME=Sheet1
```

### **2. Install Dependencies**
Install the required Node.js packages:

```bash
pnpm install
```

### **3. Run the Script**
Execute the script:

```bash
node ping.js
```

---

## **Code Overview**

### **Key Functions**

1. **`fetchRows()`**:
   - Fetches rows from the specified range in the Google Sheet.
   - Extracts URLs from the designated column (e.g., column `G`).

2. **`normalizeUrl(url)`**:
   - Converts the URL to lowercase and trims unnecessary whitespace.

3. **`pingUrl(url)`**:
   - Sends a GET request to test if the URL is reachable.

4. **`findWorkingUrl(domain)`**:
   - Generates multiple URL variants for a domain.
   - Tests each variant and returns the first working version.

5. **`updateRows(updates)`**:
   - Updates the validated URLs back into the same column and rows in the sheet.

6. **`main()`**:
   - Orchestrates the entire process:
     - Fetches rows.
     - Tests URLs for their working variants.
     - Updates the validated URLs back into the sheet.

---

## **Flow Overview**

1. **Fetch URLs**:
   - The script retrieves all rows in the specified range (`URL_SHEET_RANGE`).
   - Extracts the URL from each row.

2. **Normalize and Test URLs**:
   - Normalizes the domain (lowercase, trimmed).
   - Tests variants of the domain (with/without `www` and `http/https`).

3. **Update Working URLs**:
   - The working URL is written back into the same column of the corresponding row.

---

## **Example Google Sheet**

| **Website**         |
|----------------------|
| example.com          |
| https://example.com  |
| http://www.example.com |

After running the script, the sheet will be updated with validated and normalized URLs:

| **Website**           |
|------------------------|
| https://www.example.com |
| https://example.com     |
| http://www.example.com  |

---

## **Dependencies**

- **`googleapis`**:
  - For Google Sheets integration.

- **`axios`**:
  - For sending GET requests to test URLs.

- **`dotenv`**:
  - For managing environment variables.

---

## **Error Handling**

- **Invalid URLs**:
  - If no working variant is found for a domain, the script leaves the row unchanged.

- **Timeouts**:
  - A timeout of 5 seconds is applied for each URL test to avoid delays.

---

## **Customizations**

- **Batch Size**:
  - The `BATCH_SIZE` constant can be modified to adjust the number of rows processed in each batch.

- **Sheet Range**:
  - Update `URL_SHEET_RANGE` in the `.env` file to target a specific range or column.
