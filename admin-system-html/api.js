// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbwE8lrESavbFCRpnWF1C2h7h-q0essFRVHqONkVzitF7z6IZJudIIvS4kH2V2HcRDo/exec';

// 데이터 가져오기
async function fetchData(sheet = 'all') {
  try {
    const response = await fetch(`${API_URL}?action=getData&sheet=${sheet}`);
    const data = await response.json();
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
async function downloadExcel(sheet) {
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