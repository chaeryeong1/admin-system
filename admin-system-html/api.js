// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbztFR3HhNcCQGMKbiSXWz0unmxNzaGtQm5RvcbpFdO2sCcvMHhE-zeAhULJfuUWFek/exec';

// 진행 중인 요청 관리 (중복 요청 방지용)
let pendingRequests = {};

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

// 데이터 가져오기 (항상 실시간 데이터)
async function fetchData(sheet = 'all') {
  // 중복 요청 방지 (동일한 요청이 이미 진행 중이면 해당 프로미스 반환)
  if (pendingRequests[sheet]) {
    return pendingRequests[sheet];
  }

  try {
    const actualSheet = getActualSheetName(sheet);

    // JSONP를 사용하여 데이터 가져오기
    pendingRequests[sheet] = new Promise((resolve, reject) => {
      const callbackName = 'callback_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;

      // 콜백 함수 정의
      window[callbackName] = function(data) {
        // 메모리 정리
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        // 요청 완료 표시
        delete pendingRequests[sheet];

        // 데이터 반환
        resolve(data);
      };

      // 스크립트 태그 생성 및 추가
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;

      // 오류 처리
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        // 요청 완료 표시
        delete pendingRequests[sheet];

        // 에러 메시지 표시
        alert(`데이터를 가져오는 중 오류가 발생했습니다. (${sheet})`);

        // 빈 데이터 반환
        resolve({
          success: false,
          error: '데이터를 가져오는 중 오류가 발생했습니다.',
          data: []
        });
      };

      // 타임아웃 설정 (10초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }

          // 요청 완료 표시
          delete pendingRequests[sheet];

          // 타임아웃 메시지 표시
          alert(`데이터 요청 시간이 초과되었습니다. (${sheet})`);

          // 빈 데이터 반환
          resolve({
            success: false,
            error: '데이터 요청 시간이 초과되었습니다.',
            data: []
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

    return pendingRequests[sheet];
  } catch (error) {
    // 요청 완료 표시
    delete pendingRequests[sheet];

    // 에러 메시지 반환
    return {
      success: false,
      error: '데이터를 가져오는 중 오류가 발생했습니다.',
      data: []
    };
  }
}

// 데이터 추가하기
async function addData(sheet, data) {
  try {
    const actualSheet = getActualSheetName(sheet);

    // 데이터 검증
    if (!data || typeof data !== 'object') {
      throw new Error('추가할 데이터가 없거나 형식이 올바르지 않습니다.');
    }

    // CORS 우회를 위한 JSONP 방식 사용
    return new Promise((resolve, reject) => {
      const callbackName = 'add_' + Math.floor(Math.random() * 1000000);

      // 데이터를 URL 파라미터로 변환
      const dataParams = Object.entries(data).map(([key, value]) => {
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');

      const apiUrl = `${API_URL}?action=addData&sheet=${encodeURIComponent(actualSheet)}&${dataParams}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;

      // 콜백 함수 정의
      window[callbackName] = function(response) {
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
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        alert('데이터를 추가하는 중 오류가 발생했습니다.');

        resolve({
          success: false,
          error: '데이터를 추가하는 중 오류가 발생했습니다.',
          data: null
        });
      };

      // 타임아웃 설정 (10초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }

          alert('데이터 추가 요청 시간이 초과되었습니다.');

          resolve({
            success: false,
            error: '데이터 추가 요청 시간이 초과되었습니다.',
            data: null
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
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 데이터 업데이트하기
async function updateData(sheet, id, data) {
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
      const callbackName = 'update_' + Math.floor(Math.random() * 1000000);

      // 데이터를 URL 파라미터로 변환
      const dataParams = Object.entries(data).map(([key, value]) => {
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');

      const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&${dataParams}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;

      // 콜백 함수 정의
      window[callbackName] = function(response) {
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
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        alert('데이터를 업데이트하는 중 오류가 발생했습니다.');

        resolve({
          success: false,
          error: '데이터를 업데이트하는 중 오류가 발생했습니다.',
          data: null
        });
      };

      // 타임아웃 설정 (10초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }

          alert('데이터 업데이트 요청 시간이 초과되었습니다.');

          resolve({
            success: false,
            error: '데이터 업데이트 요청 시간이 초과되었습니다.',
            data: null
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
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 데이터 삭제하기
async function deleteData(sheet, id) {
  try {
    const actualSheet = getActualSheetName(sheet);

    // ID 검증
    if (!id) {
      throw new Error('삭제할 ID가 없습니다.');
    }

    // CORS 우회를 위한 JSONP 방식 사용
    return new Promise((resolve, reject) => {
      const callbackName = 'delete_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=deleteData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;

      // 콜백 함수 정의
      window[callbackName] = function(response) {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        resolve(response);
      };

      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;

      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }

        alert('데이터를 삭제하는 중 오류가 발생했습니다.');

        resolve({
          success: false,
          error: '데이터를 삭제하는 중 오류가 발생했습니다.',
          data: null
        });
      };

      // 타임아웃 설정 (10초)
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }

          alert('데이터 삭제 요청 시간이 초과되었습니다.');

          resolve({
            success: false,
            error: '데이터 삭제 요청 시간이 초과되었습니다.',
            data: null
          });
        }
      }, 10000);

      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };

      document.head.appendChild(script);
    });
  } catch (error) {
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
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
