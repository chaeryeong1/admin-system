// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyVdRXxOVKWQ5wdJQZYKHIx7w9YIpk8cQ7dVAaynTGhyvwFBzM9Y6VO9jWWrZZDXOo_/exec';

// 데이터 가져오기
async function fetchData(sheet = 'all') {
  try {
    // 시트 이름 맵핑: 내부 시트명을 실제 구글 시트명으로 변환
    const sheetMapping = {
      '사업정보': '사업정보',
      '기업정보': '기업정보',
      '계약금수령': '계약정보',
      '송금정보': '송금정보',
      'all': 'all'
    };
    
    const actualSheet = sheetMapping[sheet] || sheet;
    const response = await fetch(`${API_URL}?action=getData&sheet=${actualSheet}`);
    const data = await response.json();
    
    console.log(`${sheet} 데이터 로드 결과:`, data);
    return data;
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    return { success: false, error: error.message };
  }
}

// 데이터 추가하기
async function addData(sheet, data) {
  try {
    const response = await fetch(`${API_URL}?action=addData&sheet=${sheet}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('데이터 추가 오류:', error);
    return { success: false, error: error.message };
  }
}

// 데이터 업데이트하기
async function updateData(sheet, data) {
  try {
    const response = await fetch(`${API_URL}?action=updateData&sheet=${sheet}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (error) {
    console.error('데이터 업데이트 오류:', error);
    return { success: false, error: error.message };
  }
}

// 데이터 삭제하기
async function deleteData(sheet, id) {
  try {
    const response = await fetch(`${API_URL}?action=deleteData&sheet=${sheet}&id=${id}`);
    return await response.json();
  } catch (error) {
    console.error('데이터 삭제 오류:', error);
    return { success: false, error: error.message };
  }
}

// 엑셀 파일 다운로드
async function downloadExcelFile(sheet) {
  try {
    const response = await fetch(`${API_URL}?action=exportToExcel&sheet=${sheet}`);
    const data = await response.json();
    
    if (data.success && data.url) {
      // 새 탭에서 다운로드 URL 열기
      window.open(data.url, '_blank');
      return { success: true };
    } else {
      return { success: false, error: data.error || '파일 다운로드 실패' };
    }
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return { success: false, error: error.message };
  }
}

// 파일 업로드
async function uploadFile(formData) {
  try {
    const response = await fetch(`${API_URL}?action=uploadFile`, {
      method: 'POST',
      body: formData
    });
    return await response.json();
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    return { success: false, error: error.message };
  }
}

// 데이터 유효성 검사 - 공통 함수
function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName}은(는) 필수입니다`;
  }
  return null;
}

// 숫자 유효성 검사
function validateNumber(value, fieldName) {
  if (isNaN(value) || value <= 0) {
    return `${fieldName}은(는) 유효한 숫자여야 합니다`;
  }
  return null;
}