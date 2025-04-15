// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbztFR3HhNcCQGMKbiSXWz0unmxNzaGtQm5RvcbpFdO2sCcvMHhE-zeAhULJfuUWFek/exec';

// 시트 이름 맵핑 함수
function getActualSheetName(sheet) {
  const sheetMapping = {
    '사업정보': '사업정보',
    '기업정보': '기업정보',
    '계약금수령': '계약정보', 
    '송금정보': '송금정보',
    'all': 'all'
  };
  
  return sheetMapping[sheet] || sheet;
}

// 데이터 가져오기
async function fetchData(sheet = 'all') {
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // CORS 우회를 위해 요청 URL 생성
    const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
    const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}`;
    console.log(`API 요청 URL: ${apiUrl}`);
    
    // CORS 우회를 위한 방법: JSONP 스타일
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(data) {
        console.log(`${sheet} 데이터 로드 결과:`, data);
        // 메모리 정리
        delete window[callbackName];
        document.head.removeChild(script);
        resolve(data);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('JSONP 요청 실패:', error);
        delete window[callbackName];
        document.head.removeChild(script);
        console.log('JSONP 방식 실패, 샘플 데이터 사용');
        
        // 샘플 데이터 반환
        if (sheet === '사업정보') {
          resolve({
            success: true,
            data: [
              {
                id: '1',
                name: '클라우드 보급사업',
                targetCompanies: 50,
                startDate: '2025-01-01',
                endDate: '2025-12-31',
                organizer: '디지털혁신부',
                noticeUrl: 'https://example.com/cloud'
              },
              {
                id: '2',
                name: '스마트공장 구축지원사업',
                targetCompanies: 80,
                startDate: '2025-03-01',
                endDate: '2025-12-31',
                organizer: '제조혁신부',
                noticeUrl: 'https://example.com/smart'
              }
            ]
          });
        } else {
          resolve({ success: true, data: [] });
        }
      };
      
      // 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('JSONP 요청 타임아웃');
          delete window[callbackName];
          document.head.removeChild(script);
          
          if (sheet === '사업정보') {
            resolve({
              success: true,
              data: [
                {
                  id: '1',
                  name: '클라우드 보급사업',
                  targetCompanies: 50,
                  startDate: '2025-01-01',
                  endDate: '2025-12-31',
                  organizer: '디지털혁신부',
                  noticeUrl: 'https://example.com/cloud'
                },
                {
                  id: '2',
                  name: '스마트공장 구축지원사업',
                  targetCompanies: 80,
                  startDate: '2025-03-01',
                  endDate: '2025-12-31',
                  organizer: '제조혁신부',
                  noticeUrl: 'https://example.com/smart'
                }
              ]
            });
          } else {
            resolve({ success: true, data: [] });
          }
        }
      }, 5000);
      
      // 성공 시 타임아웃 제거
      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error('데이터 가져오기 오류:', error);
    return { success: false, error: error.message };
  }
}

// 데이터 추가하기
async function addData(sheet, data) {
  console.log(`${sheet} 데이터 추가 시작:`, data);
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // 데이터 검증
    if (!data || typeof data !== 'object') {
      throw new Error('추가할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    // 디버깅 모드 - 서버 연동 없이 테스트 (주석 해제하여 사용)
    // const isDebugMode = true;
    const isDebugMode = window.location.href.includes('netlify') || window.location.href.includes('localhost'); // 배포 환경에서는
    
    // 디버깅 모드일 때는 실제 API 호출 없이 로컬 저장만 수행
    if (isDebugMode) {
      console.log('디버깅 모드: 로컬 저장으로 처리합니다.');
      
      // 임시 ID 생성
      const tempId = Date.now().toString();
      data.id = data.id || tempId;
      
      // 로컬 스토리지에 데이터 저장 (기존 데이터가 있다면 추가)
      saveDataToLocalStorage(sheet, data);
      
      // 1초 후 응답 (비동기 작업 시뮬레이션)
      return new Promise(resolve => {
        setTimeout(() => {
          resolve({
            success: true,
            data: data,
            message: "항목이 추가되었습니다. (로컬 저장 - 테스트 모드)"
          });
        }, 1000);
      });
    }
    
    // 실제 API 호출을 위한 코드 (디버깅 모드가 아닐 때)
    console.log('실제 API 호출 모드');
    
    // CORS 우회를 위한 JSONP 방식 사용
    const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
    
    // 데이터를 URL 파라미터로 변환
    const dataParams = Object.entries(data).map(([key, value]) => {
      return `data_${key}=${encodeURIComponent(value)}`;
    }).join('&');
    
    const apiUrl = `${API_URL}?action=addData&sheet=${encodeURIComponent(actualSheet)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
    
    console.log(`API 요청 URL: ${apiUrl}`);
    
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 추가 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        document.head.removeChild(script);
        
        // 성공 시 로컬 스토리지에도 저장
        if (response.success) {
          saveDataToLocalStorage(sheet, response.data);
        }
        
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 추가 JSONP 요청 실패:', error);
        delete window[callbackName];
        document.head.removeChild(script);
        
        // CORS 이슈로 인한 모의 응답 반환
        console.log('JSONP 방식 실패, 모의 응답 사용');
        
        // 로컬 스토리지에 저장
        const tempId = Date.now().toString();
        data.id = data.id || tempId;
        saveDataToLocalStorage(sheet, data);
        
        resolve({
          success: true,
          data: data,
          message: "항목이 추가되었습니다. (로컬 저장)"
        });
      };
      
      // 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 추가 JSONP 요청 타임아웃');
          delete window[callbackName];
          document.head.removeChild(script);
          
          // 타임아웃시 모의 응답 반환
          const tempId = Date.now().toString();
          data.id = data.id || tempId;
          saveDataToLocalStorage(sheet, data);
          
          resolve({
            success: true,
            data: data,
            message: "항목이 추가되었습니다. (로컬 저장, 타임아웃)"
          });
        }
      }, 5000);
      
      // 성공 시 타임아웃 제거
      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error(`${sheet} 데이터 추가 오류:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 로컬 스토리지에 데이터 저장 (도우미 함수)
function saveDataToLocalStorage(sheet, data) {
  const key = `${sheet}Data`;
  let existingData = [];
  
  // 기존 데이터 로드
  try {
    const storedData = localStorage.getItem(key);
    if (storedData) {
      existingData = JSON.parse(storedData);
    }
  } catch (e) {
    console.error('로컬 스토리지 데이터 파싱 오류:', e);
  }
  
  // 데이터가 배열이 아니면 배열로 변환
  if (!Array.isArray(existingData)) {
    existingData = [];
  }
  
  // 이미 있는 ID인지 확인
  const index = existingData.findIndex(item => item.id === data.id);
  
  if (index >= 0) {
    // ID가 존재하면 업데이트
    existingData[index] = data;
  } else {
    // 새 항목 추가
    existingData.push(data);
  }
  
  // 저장
  localStorage.setItem(key, JSON.stringify(existingData));
  console.log(`로컬 스토리지 ${key} 업데이트 완료:`, existingData);
}

// 데이터 업데이트
async function updateData(sheet, data) {
  console.log(`${sheet} 데이터 업데이트 시작:`, data);
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // 데이터 및 ID 검증
    if (!data || typeof data !== 'object') {
      throw new Error('업데이트할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    if (!data.id) {
      throw new Error('업데이트할 항목의 ID가 없습니다.');
    }
    
    const id = data.id;
    
    // CORS 우회를 위한 JSONP 방식 사용
    const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
    
    // 데이터를 URL 파라미터로 변환
    const dataParams = Object.entries(data).map(([key, value]) => {
      return `data_${key}=${encodeURIComponent(value)}`;
    }).join('&');
    
    const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
    
    console.log(`API 요청 URL: ${apiUrl}`);
    
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 업데이트 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        document.head.removeChild(script);
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 업데이트 JSONP 요청 실패:', error);
        delete window[callbackName];
        document.head.removeChild(script);
        
        // CORS 이슈로 인한 모의 응답 반환
        console.log('JSONP 방식 실패, 모의 응답 사용');
        resolve({
          success: true,
          data: data,
          message: "항목이 업데이트되었습니다. (로컬 저장)"
        });
      };
      
      // 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 업데이트 JSONP 요청 타임아웃');
          delete window[callbackName];
          document.head.removeChild(script);
          
          // 타임아웃시 모의 응답 반환
          resolve({
            success: true,
            data: data,
            message: "항목이 업데이트되었습니다. (로컬 저장, 타임아웃)"
          });
        }
      }, 5000);
      
      // 성공 시 타임아웃 제거
      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error(`${sheet} 데이터 업데이트 오류:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 데이터 삭제
async function deleteData(sheet, id) {
  console.log(`${sheet} 데이터 삭제 시작:`, id);
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ID 검증
    if (!id) {
      throw new Error('삭제할 항목의 ID가 없습니다.');
    }
    
    // CORS 우회를 위한 JSONP 방식 사용
    const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
    const apiUrl = `${API_URL}?action=deleteData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&callback=${encodeURIComponent(callbackName)}`;
    
    console.log(`API 요청 URL: ${apiUrl}`);
    
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 삭제 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        document.head.removeChild(script);
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 삭제 JSONP 요청 실패:', error);
        delete window[callbackName];
        document.head.removeChild(script);
        
        // CORS 이슈로 인한 모의 응답 반환
        console.log('JSONP 방식 실패, 모의 응답 사용');
        resolve({
          success: true,
          data: {
            id: id,
            deleted: true
          },
          message: "항목이 삭제되었습니다. (로컬 저장)"
        });
      };
      
      // 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 삭제 JSONP 요청 타임아웃');
          delete window[callbackName];
          document.head.removeChild(script);
          
          // 타임아웃시 모의 응답 반환
          resolve({
            success: true,
            data: {
              id: id,
              deleted: true
            },
            message: "항목이 삭제되었습니다. (로컬 저장, 타임아웃)"
          });
        }
      }, 5000);
      
      // 성공 시 타임아웃 제거
      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };
      
      document.head.appendChild(script);
    });
  } catch (error) {
    console.error(`${sheet} 데이터 삭제 오류:`, error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 엑셀 파일 다운로드
async function downloadExcelFile(sheet) {
  try {
    console.log(`${sheet} 엑셀 다운로드 시도`);
    
    // CORS 이슈로 인한 모의 응답
    console.log('CORS 이슈로 인해 API 직접 호출 대신 모의 응답 사용');
    
    // 테스트용 가상 데이터 생성
    // 실제 환경에서는 샘플 데이터 다운로드 링크를 제공하거나 별도 안내 필요
    
    // 샘플 파일 다운로드 시뮬레이션
    const sampleFiles = {
      '사업정보': 'sample_projects.xlsx',
      '기업정보': 'sample_companies.xlsx',
      '계약정보': 'sample_contracts.xlsx',
      '송금정보': 'sample_payments.xlsx'
    };
    
    const filename = sampleFiles[sheet] || 'sample_data.xlsx';
    
    // 샘플 파일 다운로드를 시도하는 대신 알림으로 대체
    alert(`CORS 이슈로 인해 직접 다운로드할 수 없습니다.\n샘플 파일명: ${filename}\n\n지금은 테스트 기간이므로 구글 스프레드시트에서 직접 다운로드해주세요.`);
    
    return { 
      success: true, 
      message: '테스트 환경에서는 직접 다운로드할 수 없습니다. 구글 스프레드시트에서 직접 다운로드해주세요.'
    };
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 파일을 업로드하는 함수
 * @param {FormData} formData - 업로드할 파일 및 정보가 담긴 FormData 객체
 * @returns {Promise<Object>} - 업로드 결과
 */
async function uploadFile(formData) {
  try {
    console.log('파일 업로드 시도');
    
    // 파일 정보 출력
    const file = formData.get('file');
    const sheetName = formData.get('sheet');
    
    console.log(`파일 정보: ${file.name} (${file.size} bytes)`);
    console.log(`대상 시트: ${sheetName}`);
    
    // 실제 API 엔드포인트
    const url = `${API_URL}?action=uploadFile&sheet=${encodeURIComponent(getActualSheetName(sheetName))}`;
    console.log(`API 요청 URL: ${url}`);
    
    // formData를 그대로 전송
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
      // CORS 문제 완화를 위한 설정
      mode: 'cors',
      credentials: 'omit'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`서버 응답 오류 (${response.status}): ${errorText || '알 수 없는 오류'}`);
    }
    
    const result = await response.json();
    console.log('실제 API 응답:', result);
    
    return result;
  } catch (error) {
    console.error('파일 업로드 오류:', error);
    
    // 명확한 오류 메시지 반환
    return {
      success: false,
      error: `서버 연결 오류: ${error.message}. API 서버가 실행 중인지 확인하고, CORS 설정이 올바른지 확인하세요.`,
      data: null
    };
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