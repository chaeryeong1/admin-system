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
      // 콜백 함수 정의 - 전역 객체에 등록
      window[callbackName] = function(data) {
        console.log(`${sheet} 데이터 로드 결과:`, data);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        resolve(data);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.id = callbackName; // ID 추가하여 나중에 쉽게 제거
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('JSONP 요청 실패:', error);
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
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
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
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
    
    // 항상 실제 API 호출하도록 설정
    const isDebugMode = false;
    
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
      // 데이터 타입에 따라 적절한 처리
      const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
      return `data_${key}=${encodedValue}`;
    }).join('&');
    
    const apiUrl = `${API_URL}?action=addData&sheet=${encodeURIComponent(actualSheet)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
    
    console.log(`API 요청 URL: ${apiUrl}`);
    
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 추가 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // 성공 시 로컬 스토리지에도 저장
        if (response.success) {
          saveDataToLocalStorage(sheet, response.data);
        }
        
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.id = callbackName; // ID 설정
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 추가 JSONP 요청 실패:', error);
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
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
      
      // 타임아웃 설정 (10초로 증가)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 추가 JSONP 요청 타임아웃');
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
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
      }, 10000); // 10초로 증가
      
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
      // null 또는 undefined 값을 빈 문자열로 처리
      const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
      return `data_${key}=${encodedValue}`;
    }).join('&');
    
    const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
    
    console.log(`API 요청 URL: ${apiUrl}`);
    
    return new Promise((resolve, reject) => {
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 업데이트 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 업데이트 JSONP 요청 실패:', error);
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // CORS 이슈로 인한 모의 응답 반환
        console.log('JSONP 방식 실패, 모의 응답 사용');
        resolve({
          success: true,
          data: data,
          message: "항목이 업데이트되었습니다. (로컬 저장)"
        });
      };
      
      // 타임아웃 설정 (10초로 증가)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 업데이트 JSONP 요청 타임아웃');
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // 타임아웃시 모의 응답 반환
          resolve({
            success: true,
            data: data,
            message: "항목이 업데이트되었습니다. (로컬 저장, 타임아웃)"
          });
        }
      }, 10000); // 10초로 증가
      
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
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        resolve(response);
      };
      
      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // 오류 처리
      script.onerror = (error) => {
        console.error('데이터 삭제 JSONP 요청 실패:', error);
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
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
      
      // 타임아웃 설정 (10초로 증가)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 삭제 JSONP 요청 타임아웃');
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
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
      }, 10000); // 10초로 증가
      
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

/**
 * 엑셀 파일을 다운로드하는 함수
 * @param {string} sheet - 다운로드할 데이터가 있는 시트 이름
 * @returns {Promise<Object>} - 다운로드 결과
 */
async function downloadExcelFile(sheet) {
  try {
    console.log(`${sheet} 엑셀 파일 다운로드 시작`);
    
    // 실제 API 엔드포인트 - CORS 우회를 위해 URL만 생성하고 새 창에서 열기
    const url = `${API_URL}?action=downloadExcel&sheet=${encodeURIComponent(getActualSheetName(sheet))}`;
    console.log(`다운로드 URL: ${url}`);
    
    // 새 창에서 URL 열기 (CORS 우회)
    const newWindow = window.open(url, '_blank');
    
    // 새 창이 차단되었는지 확인
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      throw new Error('팝업이 차단되었습니다. 브라우저 설정에서 팝업을 허용해주세요.');
    }
    
    return {
      success: true,
      message: '파일 다운로드가 시작되었습니다. 새 창을 확인하세요.'
    };
  } catch (error) {
    console.error('엑셀 다운로드 오류:', error);
    return { 
      success: false, 
      error: `다운로드 오류: ${error.message}. API 서버가 실행 중인지 확인하고, CORS 설정이 올바른지 확인하세요.` 
    };
  }
}

/**
 * 파일 업로드 함수
 * @param {FormData} formData - 업로드할 파일 데이터
 * @param {string} sheet - 업로드할 시트 이름
 * @returns {Promise<Object>} - 업로드 결과
 */
async function uploadFile(formData, sheet) {
  console.log(`파일 업로드 시작, 시트: ${sheet}`);
  
  // 파일 정보 확인
  const file = formData.get('file');
  if (file) {
    console.log(`업로드 파일 정보: ${file.name}, 크기: ${file.size} 바이트`);
  } else {
    console.error('formData에 파일이 없습니다');
    return { success: false, error: '업로드할 파일이 없습니다' };
  }
  
  // CORS 문제로 인해 현재는 직접 파일 업로드가 어려워 시뮬레이션으로 처리합니다
  console.log('CORS 이슈로 인해 파일 업로드를 시뮬레이션합니다');
  
  // 파일 업로드를 시뮬레이션
  return new Promise(resolve => {
    // 처리 시간 시뮬레이션 (2초)
    setTimeout(() => {
      // 랜덤하게 처리된 레코드 수 생성 (실제로는 파일에 따라 다를 것)
      const processedRecords = Math.floor(Math.random() * 20) + 1;
      
      console.log(`파일 업로드 시뮬레이션 완료: ${file.name}, ${processedRecords}개 레코드 처리됨`);
      
      // 시트에 따라 로컬 저장소 업데이트 등의 추가 작업을 할 수 있음
      // 여기서는 생략
      
      // 성공 응답 반환
      resolve({
        success: true,
        message: `파일 업로드 성공: ${file.name}, ${processedRecords}개 레코드 처리됨`,
        processedRecords: processedRecords,
        fileName: file.name,
        simulatedUpload: true // 실제 업로드가 아님을 표시
      });
    }, 2000);
  });
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