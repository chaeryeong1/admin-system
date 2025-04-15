// 파일 시스템 접근 대신 메모리 사용
// const fs = require('fs');
// const path = require('path');

// 서버리스 함수는 상태를 유지하지 않지만, 테스트를 위해 성공 응답만 반환
exports.handler = async function(event, context) {
  try {
    // POST 요청인지 확인
    if (event.httpMethod !== 'POST') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ success: false, error: '허용되지 않는 메소드' }) 
      };
    }
    
    // 요청 데이터 파싱
    const projectData = JSON.parse(event.body);
    
    // 새 ID 생성
    const newId = Date.now().toString();
    
    // 프로젝트 데이터에 ID 추가
    const responseData = { 
      id: newId, 
      ...projectData,
      createdAt: new Date().toISOString() 
    };
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'  // 캐싱 방지
      },
      body: JSON.stringify({ 
        success: true, 
        data: responseData,
        message: "항목이 추가되었습니다." 
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        success: false, 
        error: '프로젝트 추가 중 오류가 발생했습니다.' 
      })
    };
  }
}; 