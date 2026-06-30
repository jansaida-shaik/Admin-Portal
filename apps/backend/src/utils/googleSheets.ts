import { google } from 'googleapis';

export const appendRowToSheet = async (sheetId: string, range: string, values: any[][]) => {
  // If Google Credentials aren't present, just mock it
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    console.log(`[SHEETS MOCK] Appending row to Sheet ID ${sheetId}, Range: ${range}`);
    console.log(`[SHEETS MOCK] Values:`, values);
    return { success: true, mocked: true };
  }

  try {
    const auth = new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({ version: 'v4', auth });
    
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: range,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: values
      }
    });

    console.log(`[SHEETS] Row appended to ${sheetId}`);
    return { success: true, response: response.data };
  } catch (error) {
    console.error('[SHEETS ERROR] Failed to append row:', error);
    return { success: false, error };
  }
};
