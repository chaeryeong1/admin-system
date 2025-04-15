const { google } = require("googleapis");

exports.handler = async function (event, context) {
  // CORS 헤더 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS"
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  const { GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL, GOOGLE_SHEET_ID } = process.env;

  const auth = new google.auth.JWT(
    GOOGLE_CLIENT_EMAIL,
    null,
    GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ["https://www.googleapis.com/auth/spreadsheets"]
  );

  const sheets = google.sheets({ version: "v4", auth });

  try {
    // 시트에서 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Sheet1!A:D", // A부터 D열까지 데이터 가져오기
    });

    const rows = response.data.values || [];
    
    // 첫 번째 행은 헤더이므로 제외하고 처리
    const companies = rows.slice(1).map((row, index) => {
      return {
        id: index + 1,
        name: row[0] || "",
        address: row[1] || "",
        contact: row[2] || "",
        cashback: Number(row[3] || 0)
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, companies })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}; 