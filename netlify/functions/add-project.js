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
    
    // 메모리에만 저장 (실제로는 저장되지 않음)
    console.log('새 프로젝트 추가 (메모리만):', { id: newId, ...projectData });
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        success: true, 
        id: newId,
        message: "항목이 추가되었습니다. (테스트 환경)" 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: '프로젝트 추가 중 오류가 발생했습니다.' 
      })
    };
  }
}; 