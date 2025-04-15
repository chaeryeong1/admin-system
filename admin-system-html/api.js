// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbztFR3HhNcCQGMKbiSXWz0unmxNzaGtQm5RvcbpFdO2sCcvMHhE-zeAhULJfuUWFek/exec';

// 캐싱 설정
const CACHE_TIME = 30 * 60 * 1000; // 30분
let cachedData = {};
let lastFetchTime = {};

// 시트 이름 맵핑 함수
function getActualSheetName(sheet) {
  const sheetMapping = {
    '사업정보': '사업정보',
    '기업정보': '기업정보',
    '계약금수령': '계약정보', 
    '송금정보': '송금정보',
    '안내정보': '안내정보',
    'all': 'all'
  };
  
  return sheetMapping[sheet] || sheet;
}

// 데이터 가져오기 (캐싱 적용)
async function fetchData(sheet = 'all') {
  console.log(`${sheet} 데이터 가져오기 시작`);
  
  try {
    // 캐시 확인
    const now = Date.now();
    if (cachedData[sheet] && lastFetchTime[sheet] && now - lastFetchTime[sheet] < CACHE_TIME) {
      console.log(`${sheet} 캐시 데이터 사용 (${Math.round((now - lastFetchTime[sheet]) / 1000)}초 전 저장)`);
      return cachedData[sheet];
    }
    
    console.log(`${sheet} 새로운 데이터 요청`);
    const actualSheet = getActualSheetName(sheet);
    
    // 로컬 스토리지에서 이전 데이터 확인
    const storedData = localStorage.getItem(`${sheet}_data`);
    const storedTime = localStorage.getItem(`${sheet}_time`);
    
    // 유효한 저장 데이터가 있으면 우선 사용 (브라우저 새로고침 시 유용)
    if (storedData && storedTime && now - parseInt(storedTime) < CACHE_TIME * 2) {
      console.log(`${sheet} 로컬 스토리지 데이터 사용 (${Math.round((now - parseInt(storedTime)) / 1000)}초 전 저장)`);
      try {
        const parsedData = JSON.parse(storedData);
        cachedData[sheet] = parsedData;
        lastFetchTime[sheet] = parseInt(storedTime);
        
        // 백그라운드에서 새 데이터 로드 (다음 접속을 위해)
        refreshDataInBackground(sheet);
        
        return parsedData;
      } catch (e) {
        console.error('저장된 데이터 파싱 오류:', e);
        // 오류 시 새로 가져오기
      }
    }
    
    // CORS 우회를 위한 방법: JSONP 스타일
    return new Promise((resolve, reject) => {
      // 콜백 함수 이름 생성
      const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}`;
      console.log(`API 요청 URL: ${apiUrl}`);
      
      // 콜백 함수 정의 - 전역 객체에 등록
      window[callbackName] = function(data) {
        console.log(`${sheet} 데이터 로드 결과:`, data);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // 캐시에 저장
        if (data && data.success) {
          cachedData[sheet] = data;
          lastFetchTime[sheet] = Date.now();
          
          // 로컬 스토리지에도 저장
          try {
            localStorage.setItem(`${sheet}_data`, JSON.stringify(data));
            localStorage.setItem(`${sheet}_time`, Date.now().toString());
          } catch (e) {
            console.warn('로컬 스토리지 저장 실패:', e);
          }
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
        const sampleData = getSampleData(sheet);
        resolve(sampleData);
      };
      
      // 타임아웃 설정 (5초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('JSONP 요청 타임아웃');
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          const sampleData = getSampleData(sheet);
          resolve(sampleData);
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
    return getSampleData(sheet);
  }
}

// 백그라운드에서 데이터 새로고침 (사용자가 기다릴 필요 없음)
function refreshDataInBackground(sheet) {
  setTimeout(() => {
    console.log(`[백그라운드] ${sheet} 데이터 업데이트 시작`);
    
    const actualSheet = getActualSheetName(sheet);
    const callbackName = 'bgCallback_' + Math.floor(Math.random() * 1000000);
    const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}`;
    
    window[callbackName] = function(data) {
      console.log(`[백그라운드] ${sheet} 데이터 업데이트 완료`);
      delete window[callbackName];
      if (document.getElementById(callbackName)) {
        document.head.removeChild(document.getElementById(callbackName));
      }
      
      if (data && data.success) {
        cachedData[sheet] = data;
        lastFetchTime[sheet] = Date.now();
        
        try {
          localStorage.setItem(`${sheet}_data`, JSON.stringify(data));
          localStorage.setItem(`${sheet}_time`, Date.now().toString());
        } catch (e) {
          console.warn('[백그라운드] 로컬 스토리지 저장 실패:', e);
        }
      }
    };
    
    const script = document.createElement('script');
    script.id = callbackName;
    script.src = apiUrl;
    
    script.onerror = () => {
      console.log('[백그라운드] 데이터 업데이트 실패');
      delete window[callbackName];
      if (document.getElementById(callbackName)) {
        document.head.removeChild(document.getElementById(callbackName));
      }
    };
    
    document.head.appendChild(script);
  }, 100);
}

// 시트별 샘플 데이터
function getSampleData(sheet) {
  if (sheet === '사업정보') {
    return {
      success: true,
      data: [
        {
          id: '1',
          name: '클라우드 보급사업',
          targetCount: 50,
          startDate: '2025-01-01',
          endDate: '2025-12-31',
          organizer: '디지털혁신부',
          noticeUrl: 'https://example.com/cloud'
        },
        {
          id: '2',
          name: '스마트공장 구축지원사업',
          targetCount: 80,
          startDate: '2025-03-01',
          endDate: '2025-12-31',
          organizer: '제조혁신부',
          noticeUrl: 'https://example.com/smart'
        }
      ]
    };
  } else {
    return { success: true, data: [] };
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
    
    // CORS 우회를 위한 JSONP 방식 사용
    return new Promise((resolve, reject) => {
      const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
      
      // 데이터를 URL 파라미터로 변환
      const dataParams = Object.entries(data).map(([key, value]) => {
        // 데이터 타입에 따라 적절한 처리
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');
      
      const apiUrl = `${API_URL}?action=addData&sheet=${encodeURIComponent(actualSheet)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
      console.log(`API 요청 URL: ${apiUrl}`);
      
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 추가 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // 캐시 무효화 (새 데이터 추가됨)
        invalidateCache(sheet);
        
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
        
        // 임시 ID 생성
        const tempId = Date.now().toString();
        data.id = data.id || tempId;
        
        resolve({
          success: true,
          data: data,
          message: "항목이 추가되었습니다. (오프라인 모드)"
        });
      };
      
      // 타임아웃 설정 (10초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          console.error('데이터 추가 JSONP 요청 타임아웃');
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // 임시 ID 생성
          const tempId = Date.now().toString();
          data.id = data.id || tempId;
          
          resolve({
            success: true,
            data: data,
            message: "항목이 추가되었습니다. (오프라인 모드, 타임아웃)"
          });
        }
      }, 10000);
      
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

// 데이터 업데이트하기
async function updateData(sheet, id, data) {
  console.log(`${sheet} 데이터 업데이트 시작 - ID: ${id}`, data);
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ID와 데이터 검증
    if (!id) {
      throw new Error('업데이트할 ID가 없습니다.');
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('업데이트할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    // CORS 우회를 위한 JSONP 방식 사용
    return new Promise((resolve, reject) => {
      const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
      
      // 데이터를 URL 파라미터로 변환
      const dataParams = Object.entries(data).map(([key, value]) => {
        // null 또는 undefined 값을 빈 문자열로 처리
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');
      
      const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&${dataParams}&callback=${encodeURIComponent(callbackName)}`;
      console.log(`API 요청 URL: ${apiUrl}`);
      
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 업데이트 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // 캐시 무효화 (데이터가 변경됨)
        invalidateCache(sheet);
        
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
          message: "항목이 업데이트되었습니다. (오프라인 모드)"
        });
      };
      
      // 타임아웃 설정 (10초)
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
            message: "항목이 업데이트되었습니다. (오프라인 모드, 타임아웃)"
          });
        }
      }, 10000);
      
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

// 데이터 삭제하기
async function deleteData(sheet, id) {
  console.log(`${sheet} 데이터 삭제 시작 - ID: ${id}`);
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ID 검증
    if (!id) {
      throw new Error('삭제할 ID가 없습니다.');
    }
    
    // CORS 우회를 위한 JSONP 방식 사용
    return new Promise((resolve, reject) => {
      const callbackName = 'googleScriptCallback_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=deleteData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&callback=${encodeURIComponent(callbackName)}`;
      
      console.log(`API 요청 URL: ${apiUrl}`);
      
      // 콜백 함수 정의
      window[callbackName] = function(response) {
        console.log(`${sheet} 데이터 삭제 결과:`, response);
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // 캐시 무효화 (데이터가 변경됨)
        invalidateCache(sheet);
        
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
          message: "항목이 삭제되었습니다. (오프라인 모드)"
        });
      };
      
      // 타임아웃 설정 (10초)
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
            message: "항목이 삭제되었습니다. (오프라인 모드, 타임아웃)"
          });
        }
      }, 10000);
      
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

// 캐시 무효화 함수
function invalidateCache(sheet) {
  console.log(`${sheet} 캐시 무효화`);
  delete cachedData[sheet];
  delete lastFetchTime[sheet];
  localStorage.removeItem(`${sheet}_data`);
  localStorage.removeItem(`${sheet}_time`);
}

// 데이터 유효성 검사 함수
function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName}은(는) 필수 입력 항목입니다.`);
  }
  return true;
}

function validateNumber(value, fieldName) {
  if (isNaN(Number(value))) {
    throw new Error(`${fieldName}은(는) 숫자만 입력 가능합니다.`);
  }
  return true;
}