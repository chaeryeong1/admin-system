/**
 * 관리자 시스템 API 함수
 */

// API 기본 URL
const BASE_API_URL = 'https://script.google.com/macros/s/AKfycbyD031lOEQn_RKGDrwVmaQF_QssOSEqwSx1_Wp9UuHsykCqfJgLESTVIVHzCjv1PBE0/exec';


/**
 * 이메일 인증 코드 전송 API
 * @param {string} email - 인증 코드를 보낼 이메일
 * @param {string} verificationCode - 생성된 인증 코드
 * @returns {Promise<Object>} - API 응답 결과
 */
async function sendVerificationEmail(email, verificationCode) {
  try {
    // 개발 환경에서는 실제 이메일을 보내지 않고 콘솔에 출력
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      console.log(`[개발 모드] ${email}로 인증 코드 ${verificationCode} 전송 시뮬레이션`);
      return {
        success: true,
        message: '개발 모드: 이메일 전송 시뮬레이션 완료'
      };
    }

    // 실제 API 호출
    const response = await fetch(`${BASE_API_URL}?action=sendEmail`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        subject: '[관리자 시스템] 이메일 인증 코드',
        message: `안녕하세요. 관리자 시스템 가입을 위한 인증 코드입니다.\n\n인증 코드: ${verificationCode}\n\n이 코드는 10분간 유효합니다.`,
        verificationCode: verificationCode
      }),
    });

    // 응답 확인
    if (!response.ok) {
      throw new Error(`API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('이메일 전송 오류:', error);
    return {
      success: false,
      message: '이메일 전송 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 인증 코드 생성 함수
 * @param {number} length - 인증 코드 길이 (기본값: 6)
 * @returns {string} - 생성된 인증 코드
 */
function generateVerificationCode(length = 6) {
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
}

/**
 * 로그인 API
 * @param {string} username - 사용자 아이디
 * @param {string} password - 사용자 비밀번호
 * @returns {Promise<Object>} - API 응답 결과
 */
async function login(username, password) {
  try {
    const response = await fetch(`${BASE_API_URL}?action=login&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('로그인 오류:', error);
    return {
      success: false,
      message: '로그인 처리 중 오류가 발생했습니다.'
    };
  }
}

/**
 * 회원가입 API
 * @param {Object} userData - 사용자 데이터
 * @param {string} userData.username - 사용자 아이디
 * @param {string} userData.password - 사용자 비밀번호
 * @param {string} userData.email - 사용자 이메일
 * @param {string} userData.permission - 사용자 권한
 * @returns {Promise<Object>} - API 응답 결과
 */
async function register(userData) {
  try {
    const queryParams = new URLSearchParams({
      action: 'register',
      username: userData.username,
      password: userData.password,
      email: userData.email,
      permission: userData.permission
    });

    const response = await fetch(`${BASE_API_URL}?${queryParams.toString()}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('회원가입 오류:', error);
    return {
      success: false,
      message: '회원가입 처리 중 오류가 발생했습니다.'
    };
  }
}

// 구글 스크립트 API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbyD031lOEQn_RKGDrwVmaQF_QssOSEqwSx1_Wp9UuHsykCqfJgLESTVIVHzCjv1PBE0/exec';

// 전역 설정
const CONFIG = {
  pendingRequests: {},
  MAX_RETRY_COUNT: 3,
  DEFAULT_TIMEOUT: 15000,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  SHEET_MAPPING: {
    '사업정보': '사업정보',
    '기업정보': '기업정보',
    '계약정보': '계약정보', 
    '송금정보': '송금정보',
    '안내정보': '안내정보',
    'all': 'all'
  }
};

// 유틸리티 함수들
const UTILS = {
  // 실제 시트 이름 가져오기
  getActualSheetName(sheet) {
    return CONFIG.SHEET_MAPPING[sheet] || sheet;
  },
  
  // API 호출 정리 함수
  cleanupAPICall(callbackName, scriptId) {
    delete window[callbackName];
    if (document.getElementById(scriptId || callbackName)) {
      document.head.removeChild(document.getElementById(scriptId || callbackName));
    }
  },
  
  // MIME 타입 추출
  getMimeTypeFromExtension(fileName) {
    const extension = fileName.split('.').pop().toLowerCase();
    
    const mimeTypes = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'txt': 'text/plain',
      'csv': 'text/csv',
      'html': 'text/html',
      'htm': 'text/html',
      'zip': 'application/zip'
    };
    
    return mimeTypes[extension] || 'application/octet-stream';
  },
  
  // 유효성 검사 함수들
  validateRequired(value, fieldName) {
    if (value === undefined || value === null || value === '') {
      throw new Error(`${fieldName}은(는) 필수 입력 항목입니다.`);
    }
    return true;
  },
  
  validateNumber(value, fieldName) {
    if (isNaN(Number(value))) {
      throw new Error(`${fieldName}은(는) 숫자만 입력 가능합니다.`);
    }
    return true;
  }
};

// JSONP 요청 생성 도우미 함수
function createJSONPRequest(url, callbackName) {
  return new Promise((resolve) => {
    const scriptId = `script_${callbackName}`;
    
    // 콜백 함수 정의
    window[callbackName] = function(response) {
      UTILS.cleanupAPICall(callbackName, scriptId);
      resolve(response);
    };
    
    // 스크립트 태그 생성 및 추가
    const script = document.createElement('script');
    script.id = scriptId;
    script.src = url;
    
    // 오류 처리
    script.onerror = () => {
      console.error(`JSONP 요청 실패: ${callbackName}`);
      UTILS.cleanupAPICall(callbackName, scriptId);
      
      resolve({
        success: false,
        error: '데이터 요청 중 오류가 발생했습니다.',
        data: null
      });
    };
    
    // 타임아웃 설정
    const timeoutId = setTimeout(() => {
      if (window[callbackName]) {
        console.warn(`JSONP 요청 시간 초과: ${callbackName}`);
        UTILS.cleanupAPICall(callbackName, scriptId);
        
        resolve({
          success: false,
          error: '데이터 요청 시간이 초과되었습니다.',
          data: null
        });
      }
    }, CONFIG.DEFAULT_TIMEOUT);
    
    // 성공 시 타임아웃 제거
    const originalCallback = window[callbackName];
    window[callbackName] = function(data) {
      clearTimeout(timeoutId);
      originalCallback(data);
    };
    
    document.head.appendChild(script);
  });
}

// 데이터 가져오기 (항상 실시간 데이터)
async function fetchData(sheet = 'all') {
  // 중복 요청 방지
  const requestKey = `fetch_${sheet}_${Date.now()}`;
  if (CONFIG.pendingRequests[sheet]) {
    console.log(`이미 ${sheet} 데이터 요청이 진행 중입니다.`);
    return CONFIG.pendingRequests[sheet];
  }
  
  try {
    const actualSheet = UTILS.getActualSheetName(sheet);
    
    // POST 요청을 위한 fetch API 사용
    CONFIG.pendingRequests[sheet] = (async () => {
      try {
        console.log(`${sheet} 데이터 fetch 요청 전송`);
        
        // POST 요청 준비
        const requestData = {
          action: 'getData',
          sheet: encodeURIComponent(actualSheet)
        };
        
        // application/x-www-form-urlencoded 형식으로 변환
        const formBody = Object.entries(requestData)
          .map(([key, val]) => `${encodeURIComponent(key)}=${val}`)
          .join('&');
        
        // fetch API를 사용한 POST 요청
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json'
          },
          body: formBody,
          signal: AbortSignal.timeout ? AbortSignal.timeout(CONFIG.DEFAULT_TIMEOUT) : undefined
        });
        
        if (!response.ok) {
          throw new Error(`HTTP 오류 발생: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`${sheet} 데이터 fetch 응답 수신:`, result ? '성공' : '실패');
        
        delete CONFIG.pendingRequests[sheet];
        return result;
      } catch (fetchError) {
        console.error(`${sheet} 데이터 fetch 요청 실패:`, fetchError);
        
        // 대체 처리 - JSONP 방식 시도
        console.log(`${sheet} 데이터 JSONP 방식으로 재시도`);
        const callbackName = 'callback_' + Math.floor(Math.random() * 1000000);
        const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
        
        const result = await createJSONPRequest(apiUrl, callbackName);
        delete CONFIG.pendingRequests[sheet];
        return result;
      }
    })();
    
    return CONFIG.pendingRequests[sheet];
  } catch (error) {
    console.error('fetchData 오류:', error);
    delete CONFIG.pendingRequests[sheet];
    
    return {
      success: false,
      error: '데이터를 가져오는 중 오류가 발생했습니다: ' + error.message,
      data: []
    };
  }
}

// 데이터 추가하기
async function addData(sheet, data) {
  try {
    const actualSheet = UTILS.getActualSheetName(sheet);
    
    // 기업 ID 로깅 추가
    if (data && data.companyId) {
      console.log(`[addData] 기업 ID 확인: ${data.companyId}, 시트: ${sheet}`);
    } else {
      console.warn(`[addData] 기업 ID 없음! 데이터:`, data);
    }
    
    // 데이터 검증
    if (!data || typeof data !== 'object') {
      throw new Error('추가할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    // targetCompanies → targetCount 변환 (호환성)
    if (data.targetCompanies !== undefined && data.targetCount === undefined) {
      data.targetCount = data.targetCompanies;
      delete data.targetCompanies;
    }
    
    // 데이터를 JSON 문자열로 변환
    let jsonData;
    try {
      jsonData = JSON.stringify(data);
    } catch (jsonError) {
      console.error('데이터 직렬화 오류:', jsonError);
      return {
        success: false,
        error: '데이터 형식이 올바르지 않습니다: ' + jsonError.message,
        data: null
      };
    }
    
    // POST 요청 준비 (URLSearchParams 사용)
    const requestBody = new URLSearchParams({
      action: 'addData',
      sheet: actualSheet,
      jsonData: jsonData // 이미 JSON 문자열이므로 추가 인코딩 불필요
    });
    
    try {
      console.log('addData fetch 요청 전송');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: requestBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('addData 응답:', result);
      
      return result;
    } catch (fetchError) {
      console.error('addData fetch 요청 실패:', fetchError);
      
      // fetch 실패 시 JSONP 방식 재시도는 POST 본문 문제와 관련 없음
      // JSONP는 GET 요청이므로 여기서는 사용하지 않음
      // return createJSONPRequest(...); // JSONP 폴백 제거 또는 검토 필요

      // 오류 객체 반환
      return {
        success: false,
        error: fetchError.message || '데이터 추가 요청에 실패했습니다.',
        data: null
      };
    }
  } catch (error) {
    console.error('addData 함수 오류:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 구글 드라이브에 파일 업로드 함수
async function uploadFileToDrive(data) {
  try {
    // 파일 데이터 검증
    if (!data || !data.fileContent || !data.fileName) {
      throw new Error('파일 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    // 파일 크기 검증
    const contentSize = data.fileContent.length * 0.75; // Base64 문자열의 실제 크기 추정
    if (contentSize > CONFIG.MAX_FILE_SIZE) {
      console.warn(`파일 크기가 제한(${CONFIG.MAX_FILE_SIZE/1024/1024}MB)을 초과합니다: ${Math.round(contentSize/1024/1024)}MB`);
      return {
        success: false,
        error: `파일 크기가 제한(${CONFIG.MAX_FILE_SIZE/1024/1024}MB)을 초과합니다.`,
        data: null
      };
    }
    
    console.log('구글 드라이브 파일 업로드 시작:', data.fileName);
    
    // 업로드 요청 데이터
    const uploadData = {
      fileName: data.fileName,
      fileContent: data.fileContent,
      mimeType: data.mimeType || UTILS.getMimeTypeFromExtension(data.fileName),
      folderId: data.folderId || "1ezIOGRJH4wYwqGDZPlr6YepfuoGEipWq"
    };
    
    // 시트에 저장할 경우 관련 데이터 추가
    if (data.sheet) uploadData.sheet = data.sheet;
    if (data.id) uploadData.id = data.id;
    
    // POST 요청 준비
    const json = {
      action: 'uploadFileToDrive',
      jsonData: encodeURIComponent(JSON.stringify(uploadData))
    };
    
    const formBody = Object.entries(json)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('구글 드라이브 업로드 성공:', result.fileId);
      } else {
        console.error('구글 드라이브 업로드 실패:', result.error);
      }
      
      return result;
    } catch (fetchError) {
      console.error('업로드 요청 중 오류 발생:', fetchError);
      
      // 소형 파일만 JSONP 방식 재시도
      if (data.fileContent.length < 50000) {
        console.log('fetch 실패, JSONP 방식으로 재시도합니다...');
        
        const callbackName = 'upload_drive_' + Math.floor(Math.random() * 1000000);
        const jsonData = JSON.stringify(uploadData);
        const apiUrl = `${API_URL}?action=uploadFileToDrive&jsonData=${encodeURIComponent(jsonData)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
        
        return createJSONPRequest(apiUrl, callbackName);
      }
      
      return {
        success: false,
        error: fetchError.message || '파일 업로드에 실패했습니다.',
        data: null
      };
    }
  } catch (error) {
    console.error('구글 드라이브 업로드 함수 오류:', error);
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
    const actualSheet = UTILS.getActualSheetName(sheet);
    
    // ID 검증
    if (!id) {
      console.error('[updateData] ID 누락:', id);
      throw new Error('업데이트할 ID가 없습니다.');
    }
    
    // ID 타입 검증 및 변환
    const idStr = String(id).trim();
    if (!idStr) {
      console.error('[updateData] ID가 빈 문자열입니다:', id);
      throw new Error('유효하지 않은 ID 형식입니다.');
    }
    
    if (!data || typeof data !== 'object') {
      console.error('[updateData] 데이터 형식 오류:', data);
      throw new Error('업데이트할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    // targetCompanies → targetCount 변환 (호환성)
    if (data.targetCompanies !== undefined && data.targetCount === undefined) {
      data.targetCount = data.targetCompanies;
      delete data.targetCompanies;
    }
    
    // ID 추가
    data.id = idStr;
    
    // 인코딩 전 데이터 유효성 확인
    let dataJson;
    try {
      dataJson = JSON.stringify(data);
    } catch (jsonError) {
      console.error('[updateData] 데이터 직렬화 실패:', jsonError);
      throw new Error('데이터를 JSON으로 변환할 수 없습니다: ' + jsonError.message);
    }
    
    // 데이터 크기 확인
    if (dataJson.length > 1500) {
      console.warn('[updateData] 데이터 크기가 큼:', dataJson.length, 'bytes');
    }
    
    // POST 요청 준비
    const json = {
      action: 'updateData',
      sheet: encodeURIComponent(actualSheet),
      id: encodeURIComponent(idStr),
      jsonData: encodeURIComponent(dataJson)
    };
    
    const formBody = Object.entries(json)
      .map(([key, val]) => `${encodeURIComponent(key)}=${val}`)
      .join('&');
    
    try {
      console.log('[updateData] fetch 요청 전송');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('[updateData] 응답 처리 중:', result ? (result.success ? '성공' : '실패') : '응답 없음');
      
      return result;
    } catch (fetchError) {
      console.error('[updateData] fetch 요청 실패:', fetchError);
      
      // 작은 데이터에 한해 JSONP 방식 시도
      if (dataJson.length < 1000) {
        console.log('[updateData] JSONP 방식으로 재시도합니다...');
        
        const callbackName = 'update_' + Math.floor(Math.random() * 1000000);
        const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(idStr)}&jsonData=${encodeURIComponent(dataJson)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
        
        return createJSONPRequest(apiUrl, callbackName);
      }
      
      return {
        success: false,
        error: fetchError.message || '데이터 업데이트에 실패했습니다.',
        data: null
      };
    }
  } catch (error) {
    console.error('[updateData] 예외 발생:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

// 파일 업로드하기
async function uploadFile(sheet, data) {
  try {
    const actualSheet = UTILS.getActualSheetName(sheet);
    
    // 데이터 검증
    if (!data || typeof data !== 'object') {
      throw new Error('업로드할 데이터가 없거나 형식이 올바르지 않습니다.');
    }
    
    if (!data.file || !data.file.name || !data.file.content) {
      throw new Error('파일 정보가 올바르지 않습니다.');
    }
    
    // 파일 데이터 크기 확인
    const contentSize = data.file.content.length;
    if (contentSize > CONFIG.MAX_FILE_SIZE) {
      console.warn(`파일 크기가 큽니다: ${Math.round(contentSize/1024/1024)}MB. 구글 드라이브로 업로드합니다.`);
      
      // 구글 드라이브로 업로드 시도
      return uploadFileToDrive({
        fileName: data.file.name,
        fileContent: data.file.content,
        mimeType: data.file.mimeType || UTILS.getMimeTypeFromExtension(data.file.name),
        sheet: sheet,
        id: data.id
      });
    }
    
    // POST 요청을 위한 데이터 준비
    const jsonData = JSON.stringify(data);
    const requestData = {
      action: 'uploadFile',
      sheet: encodeURIComponent(actualSheet),
      jsonData: encodeURIComponent(jsonData)
    };
    
    const formBody = Object.entries(requestData)
      .map(([key, val]) => `${encodeURIComponent(key)}=${val}`)
      .join('&');
    
    try {
      console.log('파일 업로드 fetch 요청 전송');
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('파일 업로드 응답:', result);
      
      return result;
    } catch (fetchError) {
      console.error('파일 업로드 fetch 요청 실패:', fetchError);
      console.log('구글 드라이브 업로드를 시도합니다...');
      
      // 구글 드라이브로 업로드 시도
      try {
        return await uploadFileToDrive({
          fileName: data.file.name,
          fileContent: data.file.content,
          mimeType: data.file.mimeType || UTILS.getMimeTypeFromExtension(data.file.name),
          sheet: sheet,
          id: data.id
        });
      } catch (driveError) {
        // 모든 시도 실패 시 로컬 스토리지에 저장
        console.error('구글 드라이브 업로드도 실패:', driveError);
        
        const fileResponse = {
          success: true,
          message: "서버 연결 실패로 파일이 로컬에만 저장되었습니다.",
          id: data.id || 'local_' + Date.now(),
          fileName: data.file.name,
          localOnly: true
        };
        
        // 로컬에 파일 정보 저장 시도
        try {
          if (window.localStorage) {
            const storageKey = `file_${data.id || fileResponse.id}`;
            const fileInfo = {
              name: data.file.name,
              type: data.file.name.split('.').pop() || 'unknown',
              size: contentSize,
              savedAt: new Date().toISOString()
            };
            localStorage.setItem(storageKey, JSON.stringify(fileInfo));
          }
        } catch (storageError) {
          console.warn('로컬 스토리지 저장 실패:', storageError);
        }
        
        return fileResponse;
      }
    }
  } catch (error) {
    console.error('파일 업로드 함수 오류:', error);
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
    const actualSheet = UTILS.getActualSheetName(sheet);
    
    // ID 검증
    if (!id) {
      throw new Error('삭제할 ID가 없습니다.');
    }
    
    // ID 타입 검증 및 변환
    const idStr = String(id).trim();
    
    // POST 요청 준비
    const requestData = {
      action: 'deleteData',
      sheet: encodeURIComponent(actualSheet),
      id: encodeURIComponent(idStr)
    };
    
    const formBody = Object.entries(requestData)
      .map(([key, val]) => `${encodeURIComponent(key)}=${val}`)
      .join('&');
    
    try {
      console.log(`deleteData 요청 전송 - ID: ${idStr}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json'
        },
        body: formBody
      });
      
      if (!response.ok) {
        throw new Error(`HTTP 오류 발생: ${response.status}`);
      }
      
      const result = await response.json();
      console.log(`deleteData 응답 - ID: ${idStr}, 결과:`, result);
      
      return result;
    } catch (fetchError) {
      console.error(`deleteData fetch 요청 실패 - ID: ${idStr}:`, fetchError);
      
      // 대체 처리 - JSONP 방식 시도
      console.log(`deleteData JSONP 방식으로 재시도 - ID: ${idStr}`);
      
      const callbackName = 'delete_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=deleteData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(idStr)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
      
      return createJSONPRequest(apiUrl, callbackName);
    }
  } catch (error) {
    console.error('deleteData 함수 오류:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
}

async function getGmoneyManagementData(params = {}) {
  try {
    const response = await fetch('/api/gmoney-management?' + new URLSearchParams(params));
    if (!response.ok) throw new Error('데이터를 불러오는데 실패했습니다.');
    const data = await response.json();
    return {
      companies: data.companies.map(company => ({
        ...company,
        representativeName: company.representativeName || '',
        saupjadd: company.saupjadd || '',
        contact: company.contact || '',
        email: company.email || '',
        selectionDate: company.selectionDate || '',
        depositDate: company.depositDate || '',
        note: company.note || ''
      })),
      total: data.total
    };
  } catch (error) {
    console.error('Error fetching gmoney management data:', error);
    throw error;
  }
}