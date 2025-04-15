const fs = require('fs');
const path = require('path');

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
    
    // 파일 읽기
    const filePath = path.join(__dirname, '../data/projects.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 새 ID 생성
    const newId = Date.now().toString();
    
    // 새 프로젝트 추가
    const newProject = { id: newId, ...projectData };
    jsonData.projects.push(newProject);
    
    // 파일 저장
    fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');
    
    return {
      statusCode: 200,
      headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
      },
      body: JSON.stringify({ 
        success: true, 
        id: newId 
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