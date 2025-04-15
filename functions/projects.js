// 사업 목록 API
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
    const projects = [
      { id: 1, name: "친환경 캠페인", description: "친환경 제품 사용 촉진 캠페인", status: "진행중", budget: 5000000 },
      { id: 2, name: "스마트 홈 구축", description: "IoT 기반 스마트 홈 솔루션", status: "완료", budget: 8000000 },
      { id: 3, name: "모바일 결제 시스템", description: "간편 결제 시스템 구축", status: "진행중", budget: 12000000 },
      { id: 4, name: "클라우드 전환", description: "온프레미스에서 클라우드로 전환", status: "계획", budget: 15000000 }
    ];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, projects })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "서버 오류가 발생했습니다." })
    };
  }
}; 