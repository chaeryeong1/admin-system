// 파일 시스템 접근 대신 하드코딩된 데이터 사용
// const fs = require('fs');
// const path = require('path');

// 샘플 데이터
const sampleProjects = {
  "projects": [
    {
      "id": "1",
      "name": "클라우드 보급 사업",
      "targetCount": 50,
      "startDate": "2025-01-01",
      "endDate": "2025-12-31",
      "organizer": "정보통신산업진흥원",
      "noticeUrl": "https://example.com/notice1"
    },
    {
      "id": "2",
      "name": "디지털 전환 지원사업",
      "targetCount": 100,
      "startDate": "2025-02-15",
      "endDate": "2025-11-30",
      "organizer": "중소기업기술정보진흥원",
      "noticeUrl": "https://example.com/notice2"
    },
    {
      "id": "3",
      "name": "ICT 융합 프로젝트",
      "targetCount": 30,
      "startDate": "2025-03-01",
      "endDate": "2025-10-31",
      "organizer": "한국정보화진흥원",
      "noticeUrl": "https://example.com/notice3"
    }
  ]
};

exports.handler = async function(event, context) {
  try {
    // 쿼리 파라미터 파싱
    const params = event.queryStringParameters || {};
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    
    // 페이지네이션 계산
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // 데이터 반환
    const totalItems = sampleProjects.projects.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = sampleProjects.projects.slice(startIndex, endIndex);
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        data: paginatedData,
        page,
        totalPages,
        totalItems
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: '데이터를 불러오는 중 오류가 발생했습니다.' 
      })
    };
  }
}; 