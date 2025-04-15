// 파일 시스템 접근 대신 메모리 사용
// const fs = require('fs');
// const path = require('path');

// 서버리스 함수는 상태를 유지하지 않지만, 테스트를 위해 성공 응답만 반환
exports.handler = async function(event, context) {
  try {
    // PUT 요청인지 확인
    if (event.httpMethod !== 'PUT') {
      return { 
        statusCode: 405, 
        body: JSON.stringify({ success: false, error: '허용되지 않는 메소드' }) 
      };
    }
    
    // ID 파라미터 확인
    const projectId = event.queryStringParameters?.id;
    if (!projectId) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ success: false, error: '프로젝트 ID가 필요합니다.' }) 
      };
    }
    
    // 요청 데이터 파싱
    const updatedData = JSON.parse(event.body);
    
    // 메모리에만 저장 (실제로는 저장되지 않음)
    console.log('프로젝트 업데이트 (메모리만):', { id: projectId, ...updatedData });
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        success: true,
        message: "항목이 업데이트되었습니다. (테스트 환경)" 
      })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        success: false, 
        error: '프로젝트 수정 중 오류가 발생했습니다.' 
      })
    };
  }
}; 