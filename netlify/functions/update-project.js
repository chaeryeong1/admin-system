const fs = require('fs');
const path = require('path');

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
    
    // 파일 읽기
    const filePath = path.join(__dirname, '../data/projects.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 프로젝트 찾기
    const index = jsonData.projects.findIndex(p => p.id === projectId);
    if (index === -1) {
      return { 
        statusCode: 404, 
        body: JSON.stringify({ success: false, error: '프로젝트를 찾을 수 없습니다.' }) 
      };
    }
    
    // 프로젝트 업데이트
    jsonData.projects[index] = { ...jsonData.projects[index], ...updatedData };
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ success: true })
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