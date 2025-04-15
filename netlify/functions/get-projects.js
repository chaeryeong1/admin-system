const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  try {
    // 쿼리 파라미터 파싱
    const params = event.queryStringParameters || {};
    const page = parseInt(params.page) || 1;
    const limit = parseInt(params.limit) || 20;
    
    // JSON 파일 읽기
    const filePath = path.join(__dirname, '../data/projects.json');
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // 페이지네이션 계산
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    // 데이터 반환
    const totalItems = jsonData.projects.length;
    const totalPages = Math.ceil(totalItems / limit);
    const paginatedData = jsonData.projects.slice(startIndex, endIndex);
    
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