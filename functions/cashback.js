// 캐시백 송금 API
exports.handler = async function(event, context) {
  // CORS 헤더 설정
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS"
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
    // GET 요청 처리 - 캐시백 송금 내역 조회
    if (event.httpMethod === "GET") {
      // 실제로는 데이터베이스에서 가져올 예정이지만, 지금은 샘플 데이터로 대체
      const cashbacks = [
        { 
          id: 1, 
          company: "삼성전자", 
          amount: 500000, 
          status: "미지급", 
          requestDate: "2023-04-01",
          approvalDate: null,
          transferDate: null
        },
        { 
          id: 2, 
          company: "LG전자", 
          amount: 350000, 
          status: "지급예정", 
          requestDate: "2023-03-15",
          approvalDate: "2023-03-20",
          transferDate: null
        },
        { 
          id: 3, 
          company: "현대자동차", 
          amount: 420000, 
          status: "지급완료", 
          requestDate: "2023-02-10",
          approvalDate: "2023-02-15",
          transferDate: "2023-02-20"
        },
        { 
          id: 4, 
          company: "SK텔레콤", 
          amount: 280000, 
          status: "미지급", 
          requestDate: "2023-04-05",
          approvalDate: null,
          transferDate: null
        }
      ];

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true, cashbacks })
      };
    }
    
    // POST 요청 처리 - 캐시백 송금 요청
    if (event.httpMethod === "POST") {
      const body = JSON.parse(event.body);
      // 실제로는 데이터베이스에 저장
      
      return {
        statusCode: 201,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: "캐시백 송금 요청이 등록되었습니다.", 
          request: body 
        })
      };
    }
    
    // PUT 요청 처리 - 캐시백 송금 승인 또는 완료 처리
    if (event.httpMethod === "PUT") {
      const body = JSON.parse(event.body);
      const id = event.path.split('/').pop(); // URL에서 ID 추출
      // 실제로는 데이터베이스에서 해당 ID의 데이터 업데이트
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          success: true, 
          message: `캐시백 송금 상태가 업데이트되었습니다. (ID: ${id})`, 
          update: body 
        })
      };
    }
    
    // 지원하지 않는 메서드
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, error: "지원하지 않는 메서드입니다." })
    };
    
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: "서버 오류가 발생했습니다." })
    };
  }
}; 