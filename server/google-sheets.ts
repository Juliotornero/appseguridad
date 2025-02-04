import { google } from 'googleapis';
import type { SheetData } from '@shared/schema';

const SPREADSHEET_ID = '1P2XznuOAJPvcta-BX6Rek0S0WMT6GzTnBXkGQzqeaLU';

// Initialize Google Sheets API using credentials from environment variable
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getAllSheetData(): Promise<SheetData[]> {
  try {
    // Log the service account email for sharing purposes
    const client = await auth.getClient();
    const email = await auth.getCredentials();
    console.log('Service Account Email:', (email as any).client_email);

    // Get spreadsheet metadata to get all sheet names
    const spreadsheet = await sheets.spreadsheets.get({
      spreadsheetId: SPREADSHEET_ID,
    });

    const sheetNames = spreadsheet.data.sheets?.map(sheet => sheet.properties?.title) || [];
    console.log('Found sheets:', sheetNames);

    const allSheetData: SheetData[] = [];

    // Get data from each sheet
    for (const sheetName of sheetNames) {
      if (!sheetName) continue;

      console.log(`Fetching data from sheet: ${sheetName}`);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: SPREADSHEET_ID,
        range: sheetName,
      });

      const values = response.data.values || [];
      if (values.length === 0) {
        console.log(`No data found in sheet: ${sheetName}`);
        continue;
      }

      const headers = values[0].map(String);
      const rows = values.slice(1).map(row => row.map(String));

      console.log(`Processed ${rows.length} rows from sheet: ${sheetName}`);

      allSheetData.push({
        sheetName,
        headers,
        rows,
      });
    }

    return allSheetData;
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw error;
  }
}