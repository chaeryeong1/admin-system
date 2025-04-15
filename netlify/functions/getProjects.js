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
    // 사업 시트에서 데이터 가져오기
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: GOOGLE_SHEET_ID,
      range: "Projects!A:E", // 사업 데이터를 담은 두 번째 시트
    });

    const rows = response.data.values || [];
    
    // 첫 번째 행은 헤더이므로 제외하고 처리
    const projects = rows.slice(1).map((row, index) => {
      return {
        id: index + 1,
        name: row[0] || "",
        targetCompanies: Number(row[1] || 0),
        startDate: row[2] || "",
        endDate: row[3] || "",
        organization: row[4] || ""
      };
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, projects })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message })
    };
  }
}; 