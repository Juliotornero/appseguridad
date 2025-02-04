import { google } from 'googleapis';

const BLACKLIST_SHEET_ID = '1P2XznuOAJPvcta-BX6Rek0S0WMT6GzTnBXkGQzqeaLU';
const CHECKIN_SHEET_ID = '15vorLVe0OnGKztodinmQ4aY-wkoj7AXnfPTYPMDJt04';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_CREDENTIALS || '{}'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

const blacklistSheets = [
  { 
    name: 'Yanashpa Village', 
    dniColumn: 2,  // Columna C
    nameColumn: 1, // Columna B
    message: 'no puede ingresar con acompañantes debido a que no ha pagado el mantenimiento'
  },
  { 
    name: 'Resort', 
    dniColumn: 1,  // Columna B
    nameColumn: 0, // Columna A
    message: 'es no grata y por políticas no puede ingresar'
  },
  { 
    name: 'Procesos de demanda', 
    dniColumn: 1,  // Columna B
    nameColumn: 0, // Columna A
    message: 'tiene un proceso de demanda y no puede ingresar'
  }
];

export async function checkBlacklist(dni) {
  try {
    // Verificar cada hoja del blacklist
    for (const sheet of blacklistSheets) {
      console.log(`Checking sheet ${sheet.name} for DNI ${dni} in column ${sheet.dniColumn + 1}`);

      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: BLACKLIST_SHEET_ID,
        range: `'${sheet.name}'!A:Z`, // Agregar comillas simples para manejar espacios
      });

      const values = response.data.values || [];

      // Buscar el DNI en la columna específica de esta hoja
      const rowIndex = values.findIndex(row => {
        return row.length > sheet.dniColumn && 
               row[sheet.dniColumn].toString().trim() === dni.trim();
      });

      if (rowIndex !== -1) {
        const row = values[rowIndex];
        const name = row[sheet.nameColumn] || 'No especificado';
        console.log(`DNI ${dni} found in blacklist sheet ${sheet.name}`);
        return {
          found: true,
          sheetName: sheet.name,
          name,
          message: sheet.message
        };
      }
    }

    console.log(`DNI ${dni} not found in any blacklist sheet`);
    return { found: false };
  } catch (error) {
    console.error('Error checking blacklist:', error);
    throw error;
  }
}

// Columnas donde puede estar el DNI en el sheet de check-in
const DNI_COLUMNS = [
  8,    // I - DNI principal
  13,   // N - Invitado 1
  16,   // Q - Invitado 2
  19,   // T - Invitado 3
  22,   // W - Invitado 4
  25,   // Z - Invitado 5
  28,   // AC - Invitado 6
  31,   // AF - Invitado 7
  34,   // AI - Invitado 8
  37,   // AL - Invitado 9
  40    // AO - Invitado 10
];

export async function getLatestCheckIn(dni) {
  try {
    console.log(`Fetching check-in data for DNI ${dni}`);
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: CHECKIN_SHEET_ID,
      range: "'Check in'!A:BU", // Especificamos la hoja "Check in"
    });

    const values = response.data.values || [];

    // Filtrar filas donde el DNI aparezca en cualquiera de las columnas definidas
    const matchingRows = values.filter(row => {
      return DNI_COLUMNS.some(colIndex => {
        return row.length > colIndex && 
               row[colIndex]?.toString().trim() === dni.trim();
      });
    });

    if (matchingRows.length === 0) {
      console.log(`No check-in records found for DNI ${dni}`);
      return null;
    }

    // Ordenar por fecha de check-in (columna AQ, índice 42)
    const sortedRows = matchingRows.sort((a, b) => {
      const dateA = new Date(a[42] || '');
      const dateB = new Date(b[42] || '');
      return dateB.getTime() - dateA.getTime();
    });

    const latestRow = sortedRows[0];
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
      property: latestRow[67] || '', // BQ
    };
  } catch (error) {
    console.error('Error fetching check-in data:', error);
    throw error;
  }
}
