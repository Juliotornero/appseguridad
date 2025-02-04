import { google } from 'googleapis';
import type { SheetData } from '@shared/schema';

const BLACKLIST_SHEET_ID = '1P2XznuOAJPvcta-BX6Rek0S0WMT6GzTnBXkGQzqeaLU';
const CHECKIN_SHEET_ID = '15vorLVe0OnGKztodinmQ4aY-wkoj7AXnfPTYPMDJt04';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

interface BlacklistSheet {
  name: string;
  dniColumn: number; // Índice base 0
}

const blacklistSheets: BlacklistSheet[] = [
  { name: 'Yanashpa', dniColumn: 2 }, // Columna C
  { name: 'Resort', dniColumn: 1 }, // Columna B
  { name: 'Procesos de demanda', dniColumn: 1 }, // Columna B
];

export async function checkBlacklist(dni: string): Promise<boolean> {
  try {
    // Verificar cada hoja del blacklist
    for (const sheet of blacklistSheets) {
      console.log(`Checking sheet ${sheet.name} for DNI ${dni} in column ${sheet.dniColumn + 1}`);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: BLACKLIST_SHEET_ID,
        range: `${sheet.name}!A:Z`, // Obtener todas las columnas para asegurarnos
      });

      const values = response.data.values || [];

      // Buscar el DNI en la columna específica de esta hoja
      const found = values.some(row => {
        // Asegurarse de que la fila tiene suficientes columnas
        if (row.length > sheet.dniColumn) {
          const cellValue = row[sheet.dniColumn].toString().trim();
          return cellValue === dni.trim();
        }
        return false;
      });

      if (found) {
        console.log(`DNI ${dni} found in blacklist sheet ${sheet.name}`);
        return true;
      }
    }

    console.log(`DNI ${dni} not found in any blacklist sheet`);
    return false;
  } catch (error) {
    console.error('Error checking blacklist:', error);
    throw error;
  }
}

interface CheckInData {
  fillDate: string;
  fillTime: string;
  names: string;
  lastName: string;
  phone: string;
  nationality: string;
  email: string;
  documentType: string;
  documentNumber: string;
  birthDate: string;
  companions: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  property: string;
}

export async function getLatestCheckIn(dni: string): Promise<CheckInData | null> {
  try {
    console.log(`Fetching check-in data for DNI ${dni}`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CHECKIN_SHEET_ID,
      range: 'Form Responses 1!A2:BQ', // Excluyendo la fila de encabezados
    });

    const values = response.data.values || [];

    // Filtrar por DNI y ordenar por fecha descendente
    const matchingRows = values
      .filter(row => {
        // Asegurarse de que la fila tiene la columna del DNI (columna I, índice 8)
        return row.length > 8 && row[8]?.toString().trim() === dni.trim();
      })
      .sort((a, b) => {
        // Columna AQ (índice 42) contiene la fecha de check-in
        const dateA = new Date(a[42] || '');
        const dateB = new Date(b[42] || '');
        return dateB.getTime() - dateA.getTime();
      });

    if (matchingRows.length === 0) {
      console.log(`No check-in records found for DNI ${dni}`);
      return null;
    }

    const latestRow = matchingRows[0];
    console.log(`Found latest check-in record for DNI ${dni} from date ${latestRow[42]}`);

    return {
      fillDate: latestRow[0] || '',
      fillTime: latestRow[1] || '',
      names: latestRow[2] || '',
      lastName: latestRow[3] || '',
      phone: latestRow[4] || '',
      nationality: latestRow[5] || '',
      email: latestRow[6] || '',
      documentType: latestRow[7] || '',
      documentNumber: latestRow[8] || '',
      birthDate: latestRow[9] || '',
      companions: latestRow[10] || '',
      checkInDate: latestRow[42] || '', // AQ
      checkInTime: latestRow[43] || '', // AR
      checkOutDate: latestRow[44] || '', // AS
      property: latestRow[68] || '', // BQ
    };
  } catch (error) {
    console.error('Error fetching check-in data:', error);
    throw error;
  }
}

export async function getAllSheetData(): Promise<SheetData[]> {
  try {
    // Log authentication details
    const credentials = await auth.getCredentials();
    console.log('Attempting to authenticate with service account:', (credentials as any).client_email);
    console.log('Checking access to spreadsheet:', BLACKLIST_SHEET_ID, CHECKIN_SHEET_ID);

    // Get spreadsheet metadata to get all sheet names

    const spreadsheetBlacklist = await sheets.spreadsheets.get({
      spreadsheetId: BLACKLIST_SHEET_ID,
    });
    const spreadsheetCheckIn = await sheets.spreadsheets.get({
      spreadsheetId: CHECKIN_SHEET_ID,
    });

    const sheetNamesBlacklist = spreadsheetBlacklist.data.sheets?.map(sheet => sheet.properties?.title) || [];
    const sheetNamesCheckIn = spreadsheetCheckIn.data.sheets?.map(sheet => sheet.properties?.title) || [];

    console.log('Successfully accessed spreadsheet. Found sheets:', sheetNamesBlacklist, sheetNamesCheckIn);

    const allSheetData: SheetData[] = [];

    // Get data from each sheet
    const allSheetNames = [...sheetNamesBlacklist, ...sheetNamesCheckIn];
    const allSpreadsheetIds = [BLACKLIST_SHEET_ID, CHECKIN_SHEET_ID];
    for (let i = 0; i < allSheetNames.length; i++) {
        const sheetName = allSheetNames[i];
        const spreadsheetId = allSpreadsheetIds[i];
      if (!sheetName) continue;

      console.log(`Fetching data from sheet: ${sheetName} from spreadsheet: ${spreadsheetId}`);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: sheetName,
      });

      const values = response.data.values || [];
      if (values.length === 0) {
        console.log(`No data found in sheet: ${sheetName}`);
        continue;
      }

      const headers = values[0].map(String);
      const rows = values.slice(1).map(row => row.map(String));

      console.log(`Successfully processed ${rows.length} rows from sheet: ${sheetName}`);

      allSheetData.push({
        sheetName,
        headers,
        rows,
      });
    }

    return allSheetData;
  } catch (error) {
    console.error('Error details:', error);
    throw error;
  }
}