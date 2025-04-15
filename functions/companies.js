// 기업 목록 API
exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS"
  };

  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  try {
    // 실제로는 데이터베이스에서 가져올 예정이지만, 지금은 샘플 데이터로 대체
    const companies = [
      { id: 1, name: "삼성전자", address: "서울특별시 서초구", contact: "02-1234-5678", cashback: 500000 },
      { id: 2, name: "LG전자", address: "서울특별시 영등포구", contact: "02-2345-6789", cashback: 350000 },
      { id: 3, name: "현대자동차", address: "서울특별시 강남구", contact: "02-3456-7890", cashback: 420000 },
      { id: 4, name: "SK텔레콤", address: "서울특별시 중구", contact: "02-4567-8901", cashback: 280000 },
      { id: 5, name: "네이버", address: "경기도 성남시", contact: "031-5678-9012", cashback: 620000 }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, companies })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "서버 오류가 발생했습니다." })
    };
  }
}; 