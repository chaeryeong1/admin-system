// Google Apps Script 코드
// 이 코드를 Google 앱스 스크립트에 복사하여 사용하세요.

// 액션과 함수를 맵핑하는 테이블
const ACTION_FUNCTIONS = {
  'getData': getData,
  'addData': addData,
  'updateData': updateData,
  'deleteData': deleteData,
  'exportToExcel': exportToExcel,
  'uploadFile': uploadFile,
  'uploadFileToDrive': uploadFileToDrive,  // 이 부분 추가
  'addTestCompany': addTestCompany,
  'addMultipleTestCompanies': addMultipleTestCompanies,
  'uploadCompanies': uploadCompanies,
  'testNotificationInfo': testNotificationInfo
};

// 시트별 필드 매핑 정의
const SHEET_FIELD_MAPPINGS = {
  "기업정보": {
    "기업명": "comname",
    "홈페이지": "homepage",
    "대표자": "representative", 
    "사업자등록번호": "businessNumber",
    "전화번호": "representativePhone",
    "주소": "address",
    "종업원 수": "employeeCount",
    "업종": "industry",
    "담당자명": "manager",
    "담당자 전화번호": "phone",
    "담당자 직책": "job",
    "이메일": "email",
    "폐업정보": "CID1",
    "등록일": "registrationDate"
  },
  "사업정보": {
    "사업명": "name",
    "목표 수": "targetCount",
    "시작일": "startDate",
    "종료일": "endDate",
    "주최기관": "organizer",
    "공고": "noticeUrl"
  },
  "계약정보": {
    "기업아이디": "companyId",
    "사업아이디": "businessId",
    "계약일": "contractDate",
    "계약금액": "contractAmount",
    "캐시백금액": "cashbackAmount",
    "상태": "status",
    "CAS상태": "castatus"
  },
  "송금정보": {
    "계약아이디": "contractId",
    "요청일": "requestDate",
    "승인일": "approvalDate",
    "송금일": "transferDate",
    "금액": "amount",
    "상태": "status",
    "요청자아이디": "requestorId",
    "승인자아이디": "approverId",
    "은행명": "bankName",
    "계좌번호": "accountNumber",
    "예금주": "accountHolder",
    "통장사본": "bankImageUrl",
    "요청메모": "requestMemo",
    "승인메모": "approvalMemo",
    "송금증빙": "transferImageUrl",
    "반려사유": "rejectReason"
  },
  "안내정보": {
    "사업아이디": "businessId",
    "기업아이디": "companyId",
    "상태": "csdataaa",
    "안내사업명": "saupjadd",
  },
  "선정정보": {
    "선정확인": "selection-confirmation",
    "선정일": "selection-date"
  }
};

// 배치 처리 크기
const DEFAULT_BATCH_SIZE = 10;

// 파일 크기 제한 (바이트 단위)
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * GET 요청 처리
 */
function doGet(e) {
  try {
    // 디버깅 정보 로깅
    Logger.log("=========================================");
    Logger.log("새 요청 수신 - doGet");
    Logger.log("요청 파라미터: " + (e && e.parameter ? JSON.stringify(e.parameter) : "없음"));
    
    // 요청 파라미터 처리
    e = e || {};
    const params = e.parameter || {};
    const callback = params.callback;
    
    // 테스트 모드 확인
    if (params.test === 'true' || params.test === true) {
      const result = testUploadFile();
      Logger.log("테스트 모드 응답: " + JSON.stringify(result));
      
      // JSONP 형식으로 반환
      if (callback) {
        return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
          .setMimeType(ContentService.MimeType.JAVASCRIPT);
      } else {
        return ContentService.createTextOutput(JSON.stringify(result))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 요청 처리
    const result = handleRequest(e);
    
    // JSONP 형식으로 반환하거나 일반 JSON으로 반환
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("doGet 오류 발생: " + error.toString());
    Logger.log("오류 스택: " + (error.stack || "스택 정보 없음"));
    
    const errorResponse = {
      success: false,
      error: error.toString(),
      stack: error.stack || "스택 정보 없음"
    };
    
    const callback = e && e.parameter ? e.parameter.callback : null;
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(errorResponse) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(errorResponse))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

/**
 * POST 요청 처리
 */
function doPost(e) {
  try {
    // 디버깅 정보 로깅
    Logger.log("=========================================");
    Logger.log("새 요청 수신 - doPost");
    Logger.log("postData: " + (e && e.postData ? JSON.stringify(e.postData) : "없음"));
    
    // 요청 본문이 있는지 확인
    if (!e || !e.postData) {
      Logger.log("오류: 요청 본문이 없습니다");
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: "요청 본문이 없습니다"
      }))
      .setMimeType(ContentService.MimeType.JSON);
    }
    
    // 요청 처리 및 응답
    const result = handleRequest(e);
    
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("doPost 오류 발생: " + error.toString());
    Logger.log("오류 스택: " + (error.stack || "스택 정보 없음"));
    
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      stack: error.stack || "스택 정보 없음"
    }))
    .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * OPTIONS 요청 처리 (CORS)
 */
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 요청 처리 함수
 */
function handleRequest(e) {
  try {
    // 요청 파라미터 처리 (null 체크 추가)
    e = e || {};
    let params = {};
    let postData = null;
    
    // 요청 방식에 따른 파라미터 추출
    if (e.postData) {
      try {
        // POST 요청 본문 처리
        if (e.postData.type === "application/x-www-form-urlencoded") {
          // form-urlencoded 데이터 파싱
          const postDataText = e.postData.contents;
          const formParams = postDataText.split('&');
          
          formParams.forEach(param => {
            const [key, value] = param.split('=').map(decodeURIComponent);
            params[key] = value;
          });
          
          Logger.log("POST form-urlencoded 파라미터: " + JSON.stringify(params));
        } else {
          // 다른 타입의 POST 데이터 (JSON 등)
          try {
            postData = JSON.parse(e.postData.contents);
            params = {...params, ...postData};
            Logger.log("POST JSON 파라미터: " + JSON.stringify(params));
          } catch (jsonError) {
            Logger.log("POST 데이터 파싱 오류: " + jsonError);
            Logger.log("원본 POST 데이터: " + e.postData.contents);
          }
        }
      } catch (postDataError) {
        Logger.log("POST 데이터 처리 오류: " + postDataError);
      }
    }
    
    // GET 파라미터도 병합 (존재하는 경우)
    if (e.parameter) {
      params = {...params, ...e.parameter};
      Logger.log("GET 파라미터: " + JSON.stringify(e.parameter));
    }
    
    // 액션과 시트 파라미터 확인
    const action = params.action || 'getData';
    const sheet = params.sheet || 'all';
    
    Logger.log("=== 요청 처리 시작 ===");
    Logger.log("액션: " + action);
    Logger.log("시트: " + sheet);
    
    let result = {};
    let data = {};
    
    // URL 파라미터에서 data_* 접두사를 가진 파라미터 추출
    for (const key in params) {
      if (key.startsWith('data_')) {
        const dataKey = key.substring(5); // 'data_' 접두사 제거
        data[dataKey] = params[key];
      }
    }
    
    // 액션에 맞는 함수 실행
    if (action in ACTION_FUNCTIONS) {
      switch(action) {
        case 'getData':
          result = ACTION_FUNCTIONS[action](sheet);
          break;
          
        case 'uploadFileToDrive':
          // jsonData 파라미터 처리
          if (params.jsonData) {
            try {
              const uploadData = JSON.parse(decodeURIComponent(params.jsonData));
              Logger.log('구글 드라이브 업로드 요청 - 데이터 수신');
              result = ACTION_FUNCTIONS[action](sheet, uploadData);
            } catch (parseError) {
              Logger.log("JSON 파싱 오류: " + parseError);
              return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
            }
          } else {
            Logger.log("구글 드라이브 업로드 요청 - 데이터 없음");
            return { success: false, error: "업로드할 파일 데이터가 없습니다" };
          }
          break;
          
        case 'addData':
          if (Object.keys(data).length > 0) {
            Logger.log('데이터 추가 요청 - URL 파라미터로부터: ' + JSON.stringify(data));
            result = ACTION_FUNCTIONS[action](sheet, data);
          } else {
            const jsonData = params.jsonData;
            
            if (!jsonData) {
              Logger.log("오류: jsonData 파라미터가 없습니다");
              return { success: false, error: "데이터가 없습니다" };
            }
            
            try {
              // URL 디코딩 후 JSON 파싱
              const decodedData = decodeURIComponent(jsonData);
              const postData = JSON.parse(decodedData);
              Logger.log('데이터 추가 요청 - 파싱됨: ' + JSON.stringify(postData));
              
              // 데이터가 배열인 경우와 단일 객체인 경우 모두 처리
              if (Array.isArray(postData)) {
                result = ACTION_FUNCTIONS[action](sheet, { companies: postData });
              } else {
                result = ACTION_FUNCTIONS[action](sheet, postData);
              }
            } catch (parseError) {
              Logger.log("JSON 파싱 오류: " + parseError);
              return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
            }
          }
          break;
          
        case 'updateData':
          if (Object.keys(data).length > 0) {
            Logger.log('데이터 업데이트 요청 - URL 파라미터로부터: ' + JSON.stringify(data));
            result = ACTION_FUNCTIONS[action](sheet, data);
          } else {
            const jsonData = params.jsonData;
            
            if (!jsonData) {
              Logger.log("오류: jsonData 파라미터가 없습니다");
              return { success: false, error: "데이터가 없습니다" };
            }
            
            try {
              const postData = JSON.parse(decodeURIComponent(jsonData));
              Logger.log('데이터 업데이트 요청 - 파싱됨: ' + JSON.stringify(postData));
              result = ACTION_FUNCTIONS[action](sheet, postData);
            } catch (parseError) {
              Logger.log("JSON 파싱 오류: " + parseError);
              return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
            }
          }
          break;
          
        case 'deleteData':
          const deleteId = params.id;
          if (!deleteId) {
            Logger.log("오류: 삭제할 ID가 없습니다");
            return { success: false, error: "삭제할 ID가 없습니다" };
          }
          Logger.log('데이터 삭제 요청 - ID: ' + deleteId);
          result = ACTION_FUNCTIONS[action](sheet, deleteId);
          break;
          
        case 'uploadFile':
          // 파일 업로드 처리 (jsonData 방식으로 통일)
          if (params.jsonData) {
            try {
              const fileData = JSON.parse(decodeURIComponent(params.jsonData));
              result = ACTION_FUNCTIONS[action]({parameter: {data: JSON.stringify(fileData)}});
            } catch (parseError) {
              Logger.log("파일 데이터 파싱 오류: " + parseError);
              return { success: false, error: "파일 데이터 형식이 잘못되었습니다: " + parseError.message };
            }
          } else {
            Logger.log("파일 업로드 요청 - 데이터 없음");
            return { success: false, error: "업로드할 파일 데이터가 없습니다" };
          }
          break;
          
        case 'uploadCompanies':
          if (params.jsonData) {
            try {
              const companiesData = JSON.parse(decodeURIComponent(params.jsonData));
              result = ACTION_FUNCTIONS[action](companiesData);
            } catch (parseError) {
              Logger.log("기업 데이터 파싱 오류: " + parseError);
              return { success: false, error: "기업 데이터 형식이 잘못되었습니다: " + parseError.message };
            }
          } else {
            result = ACTION_FUNCTIONS[action](data);
          }
          break;
          
        default:
          // 다른 액션들은 별도의 파라미터 없이 직접 호출
          result = ACTION_FUNCTIONS[action]();
      }
    } else {
      Logger.log("오류: 지원하지 않는 액션 - " + action);
      result = { success: false, error: "지원하지 않는 작업입니다" };
    }
    
    Logger.log("응답 결과: " + JSON.stringify(result));
    Logger.log("=== 요청 종료 ===");
    return result;
  } catch (error) {
    Logger.log("치명적 오류 발생: " + error.toString());
    Logger.log("오류 스택: " + (error.stack || "스택 정보 없음"));
    return {
      success: false,
      error: error.toString(),
      stack: error.stack || "스택 정보 없음"
    };
  }
}

/**
 * 데이터 삭제 (개선)
 * @param {string} sheetName - 시트 이름
 * @param {string} id - 삭제할 데이터 ID
 * @return {object} - 응답 객체
 */
function deleteData(sheetName, id) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  Logger.log("====== 데이터 삭제 시작: " + sheetName + " ======");
  Logger.log("삭제할 ID: " + id);
  
  if (!sheet) {
    Logger.log("오류: 시트를 찾을 수 없음 - " + sheetName);
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  try {
    if (!id) {
      Logger.log("오류: ID가 없음");
      return { success: false, error: "삭제할 항목의 ID가 없습니다" };
    }
    
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // ID 열 인덱스 찾기
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      Logger.log("오류: ID 열을 찾을 수 없음");
      return { success: false, error: "ID 열을 찾을 수 없습니다" };
    }
    
    // 모든 ID 값 가져오기 (효율적인 방법)
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      Logger.log("오류: 데이터가 없음");
      return { success: false, error: "시트에 데이터가 없습니다" };
    }
    
    const idRange = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1);
    const idValues = idRange.getValues();
    
    // ID로 행 찾기
    let rowIndex = -1;
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]) === String(id)) {
        rowIndex = i + 2; // 헤더(1) + 인덱스(0부터 시작)
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log("오류: ID에 해당하는 행을 찾을 수 없음 - " + id);
      return { success: false, error: "ID에 해당하는 항목을 찾을 수 없습니다" };
    }
    
    // 행 삭제
    sheet.deleteRow(rowIndex);
    Logger.log("행 삭제 완료 - 행 " + rowIndex);
    
    return { 
      success: true, 
      data: {
        id: id,
        deleted: true
      },
      message: "데이터가 성공적으로 삭제되었습니다." 
    };
  } catch (error) {
    Logger.log("데이터 삭제 중 오류 발생: " + error.toString());
    return { 
      success: false, 
      error: "데이터 삭제 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 엑셀 파일 다운로드
 * @param {string} sheetName - 시트 이름
 * @return {object} - 응답 객체
 */
function exportToExcel(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  try {
    // 스프레드시트의 URL 생성
    const url = "https://docs.google.com/spreadsheets/d/" + spreadsheet.getId() + "/export?format=xlsx&gid=" + sheet.getSheetId();
    
    return { 
      success: true, 
      url: url,
      message: "엑셀 파일 다운로드 URL이 생성되었습니다." 
    };
  } catch (error) {
    Logger.log("엑셀 내보내기 오류: " + error.toString());
    return { 
      success: false, 
      error: "엑셀 파일 생성 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 파일 업로드 (개선)
 * @param {object} e - 요청 객체
 * @return {object} - 응답 객체
 */
function uploadFile(e) {
  try {
    Logger.log("파일 업로드 요청 수신");
    
    // 파라미터 검증
    if (!e || (!e.parameter?.data && !e.postData)) {
      Logger.log("오류: 데이터가 없음");
      return { success: false, error: "업로드할 파일 데이터가 없습니다" };
    }
    
    // JSON 데이터 파싱
    let jsonData;
    
    // POST 데이터 처리
    if (e.postData) {
      try {
        if (e.postData.type === "application/x-www-form-urlencoded") {
          // form-urlencoded 데이터에서 jsonData 파라미터 추출
          const postDataText = e.postData.contents;
          const params = {};
          
          postDataText.split('&').forEach(param => {
            const [key, value] = param.split('=').map(decodeURIComponent);
            params[key] = value;
          });
          
          if (params.jsonData) {
            jsonData = JSON.parse(decodeURIComponent(params.jsonData));
          } else {
            Logger.log("오류: jsonData 파라미터가 없음");
            return { success: false, error: "jsonData 파라미터가 없습니다" };
          }
        } else {
          // JSON 형식 데이터
          jsonData = JSON.parse(e.postData.contents);
        }
      } catch (parseError) {
        Logger.log("POST 데이터 파싱 오류: " + parseError + ", 원본: " + e.postData.contents);
        return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
      }
    } else if (e.parameter.data) {
      // GET 요청 또는 기존 방식
      try {
        jsonData = JSON.parse(decodeURIComponent(e.parameter.data));
      } catch (parseError) {
        Logger.log("데이터 파싱 오류: " + parseError);
        return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
      }
    } else {
      Logger.log("오류: 지원되지 않는 데이터 형식");
      return { success: false, error: "지원되지 않는 데이터 형식입니다" };
    }
    
    // 필수 필드 검증
    if (!jsonData.file?.name || !jsonData.file?.content) {
      Logger.log("파일 정보 오류: " + JSON.stringify(jsonData.file || {}));
      return { success: false, error: "파일 정보가 올바르지 않습니다" };
    }
    
    const fileName = jsonData.file.name;
    const fileContent = jsonData.file.content; // Base64 인코딩된 파일 내용
    const sheetName = jsonData.sheet || "기업정보";
    const id = jsonData.id || null;
    
    // 파일 크기 검증 (Base64 문자열 길이 기준 - 대략 4/3배)
    if (fileContent.length > MAX_FILE_SIZE * 4/3) {
      Logger.log("파일 크기 초과: " + (fileContent.length * 3/4) + " bytes");
      return { success: false, error: "파일 크기가 너무 큽니다 (최대 10MB)" };
    }
    
    Logger.log("파일명: " + fileName);
    Logger.log("시트명: " + sheetName);
    Logger.log("ID (존재하는 경우): " + id);
    
    // 스프레드시트에 파일 내용 저장
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log("시트를 찾을 수 없음: " + sheetName);
      return { success: false, error: "지정된 시트를 찾을 수 없습니다" };
    }
    
    // ID가 있는 경우 해당 데이터 업데이트
    if (id) {
      return updateFileData(sheet, id, fileName, fileContent);
    } else {
      // 신규 데이터인 경우 - 새 행 추가
      return addNewFileData(sheet, fileName, fileContent, jsonData);
    }
  } catch (error) {
    Logger.log("파일 업로드 오류: " + error.toString());
    Logger.log("스택 추적: " + error.stack);
    return { success: false, error: error.toString() };
  }
}

/**
 * 파일 데이터 업데이트
 * @param {Sheet} sheet - 스프레드시트 객체
 * @param {string} id - 업데이트할 데이터 ID
 * @param {string} fileName - 파일 이름
 * @param {string} fileContent - 파일 내용 (Base64)
 * @return {object} - 응답 객체
 */
function updateFileData(sheet, id, fileName, fileContent) {
  try {
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // ID 열 인덱스 찾기
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      Logger.log("오류: ID 열을 찾을 수 없음");
      return { success: false, error: "ID 열을 찾을 수 없습니다" };
    }
    
    // 모든 ID 값 가져오기
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, error: "시트에 데이터가 없습니다" };
    }
    
    const idRange = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1);
    const idValues = idRange.getValues();
    
    // ID로 행 찾기
    let rowIndex = -1;
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]) === String(id)) {
        rowIndex = i + 2; // 헤더(1) + 인덱스(0부터 시작)
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log("오류: ID에 해당하는 행을 찾을 수 없음 - " + id);
      return { success: false, error: "ID에 해당하는 항목을 찾을 수 없습니다" };
    }
    
    // 필요한 열 인덱스 찾기 또는 추가
    let fileContentColIndex = headers.indexOf('saupjadd');
    let fileNameColIndex = headers.indexOf('fileName');
    let updatedAtColIndex = headers.indexOf('updatedAt');
    
    // 필요한 열이 없으면 추가
    if (fileContentColIndex === -1) {
      fileContentColIndex = headers.length;
      sheet.getRange(1, fileContentColIndex + 1).setValue('saupjadd');
      headers.push('saupjadd');
    }
    
    if (fileNameColIndex === -1) {
      fileNameColIndex = headers.length;
      sheet.getRange(1, fileNameColIndex + 1).setValue('fileName');
      headers.push('fileName');
    }
    
    // 데이터 업데이트
    sheet.getRange(rowIndex, fileContentColIndex + 1).setValue(fileContent);
    sheet.getRange(rowIndex, fileNameColIndex + 1).setValue(fileName);
    
    if (updatedAtColIndex !== -1) {
      sheet.getRange(rowIndex, updatedAtColIndex + 1).setValue(new Date());
    }
    
    Logger.log("파일 데이터 업데이트 완료 - 행 " + rowIndex + ": " + fileName);
    
    return { 
      success: true, 
      message: "파일이 성공적으로 업로드되었습니다.", 
      fileName: fileName,
      id: id
    };
  } catch (error) {
    Logger.log("파일 데이터 업데이트 오류: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * 새 파일 데이터 추가
 * @param {Sheet} sheet - 스프레드시트 객체
 * @param {string} fileName - 파일 이름
 * @param {string} fileContent - 파일 내용 (Base64)
 * @param {object} jsonData - 추가 데이터
 * @return {object} - 응답 객체
 */
function addNewFileData(sheet, fileName, fileContent, jsonData) {
  try {
    // 헤더 가져오기
    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const lastColumn = sheet.getLastColumn();
    let columnsAdded = 0;
    
    // 필수 필드 확인 및 추가
    const requiredFields = ['id', 'saupjadd', 'fileName', 'createdAt', 'updatedAt'];
    
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        sheet.getRange(1, lastColumn + 1 + columnsAdded).setValue(field);
        columnsAdded++;
      }
    }
    
    // 헤더를 다시 가져오기 (열이 추가되었을 경우)
    if (columnsAdded > 0) {
      headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    }
    
    // 데이터 객체 생성
    const newId = Utilities.getUuid();
    const newData = {
      id: newId,
      createdAt: new Date(),
      updatedAt: new Date(),
      saupjadd: fileContent,
      fileName: fileName
    };
    
    // jsonData에서 추가 필드 가져오기
    for (const key in jsonData) {
      if (key !== 'file' && key !== 'sheet') {
        newData[key] = jsonData[key];
      }
    }
    
    // 행 데이터 생성
    const newRow = headers.map(header => {
      return newData[header] !== undefined ? newData[header] : '';
    });
    
    // 데이터 추가
    sheet.appendRow(newRow);
    
    Logger.log("새 파일 데이터 추가 완료 - ID: " + newId + ", 파일명: " + fileName);
    
    return { 
      success: true, 
      message: "파일이 성공적으로 업로드되었습니다.", 
      fileName: fileName,
      id: newId
    };
  } catch (error) {
    Logger.log("새 파일 데이터 추가 오류: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

/**
 * 테스트용 함수 - 파일 업로드 테스트
 * @return {object} - 테스트 결과
 */
function testUploadFile() {
  try {
    Logger.log("==== 테스트 파일 업로드 함수 시작 ====");
    
    // 스프레드시트 정보 확인
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheetList = spreadsheet.getSheets();
    const sheetNames = sheetList.map(sheet => sheet.getName());
    
    Logger.log("스프레드시트 ID: " + spreadsheet.getId());
    Logger.log("시트 목록: " + JSON.stringify(sheetNames));
    
    // 기업정보 시트 테스트
    const companySheet = spreadsheet.getSheetByName("기업정보");
    let companyData = [];
    
    if (companySheet) {
      const lastRow = companySheet.getLastRow();
      const lastCol = companySheet.getLastColumn();
      
      Logger.log("기업정보 시트 존재: 마지막 행 " + lastRow + ", 마지막 열 " + lastCol);
      
      if (lastRow > 0 && lastCol > 0) {
        const companyHeaders = companySheet.getRange(1, 1, 1, lastCol).getValues()[0];
        Logger.log("기업정보 헤더: " + JSON.stringify(companyHeaders));
        
        // 몇 개의 데이터 샘플 가져오기
        if (lastRow > 1) {
          const sampleRows = companySheet.getRange(2, 1, Math.min(lastRow - 1, 3), lastCol).getValues();
          companyData = sampleRows.map(row => {
            const rowData = {};
            companyHeaders.forEach((header, index) => {
              rowData[header] = row[index];
            });
            return rowData;
          });
          
          Logger.log("기업정보 샘플 데이터: " + JSON.stringify(companyData));
        }
      }
    } else {
      Logger.log("기업정보 시트 없음");
    }
    
    // 테스트 데이터 생성
    const testCSV = "기업명,사업자등록번호,대표자,전화번호,이메일\n테스트기업,123456789,테스트대표,010-1234-5678,test@test.com";
    const testRows = Utilities.parseCsv(testCSV);
    
    Logger.log("테스트 CSV 데이터: " + JSON.stringify(testRows));
    
    // 행 추가 테스트 (실제로 추가하지는 않음)
    if (companySheet) {
      const headers = companySheet.getRange(1, 1, 1, companySheet.getLastColumn()).getValues()[0];
      
      // 테스트 데이터 생성
      const testRowData = headers.map(header => {
        if (header === 'id') return 'TEST_ID_' + new Date().getTime();
        if (header === 'name' || header === '기업명') return '테스트기업_' + new Date().getTime();
        if (header === 'businessNumber' || header === '사업자등록번호') return '123-45-67890';
        if (header === 'registrationDate' || header === 'createdAt') return new Date();
        return '테스트_' + header;
      });
      
      Logger.log("추가할 테스트 행 데이터: " + JSON.stringify(testRowData));
      
      // 실제 추가 없이 시뮬레이션만
      Logger.log("시트에 행 추가 권한 테스트 중...");
      
      try {
        // 테스트 목적으로만 임시로 행을 추가한 후 즉시 삭제 (권한 확인용)
        const lastRow = companySheet.getLastRow();
        companySheet.appendRow(testRowData);
        Logger.log("테스트 행이 추가되었습니다.");
        
        // 추가된 행 삭제
        companySheet.deleteRow(companySheet.getLastRow());
        Logger.log("테스트 행이 삭제되었습니다.");
        
        return {
          success: true,
          message: "파일 업로드 테스트 성공",
          test_row_added: true,
          sheet_info: {
            name: "기업정보",
            rows: lastRow,
            columns: companySheet.getLastColumn(),
            headers: headers
          },
          sample_data: companyData
        };
      } catch (writeError) {
        Logger.log("시트 쓰기 권한 오류: " + writeError.toString());
        return {
          success: false,
          error: "시트 쓰기 권한이 없습니다: " + writeError.toString(),
          sheet_info: {
            name: "기업정보",
            rows: lastRow,
            columns: companySheet.getLastColumn(),
            headers: headers
          },
          sample_data: companyData
        };
      }
    }
    
    return {
      success: false,
      error: "테스트 실패 - 기업정보 시트를 찾을 수 없습니다",
      sheets: sheetNames
    };
    
  } catch (error) {
    Logger.log("테스트 중 오류 발생: " + error.toString());
    Logger.log("스택: " + (error.stack || "스택 정보 없음"));
    
    return {
      success: false,
      error: "테스트 중 오류 발생: " + error.toString(),
      stack: error.stack || "스택 정보 없음"
    };
  }
}

/**
 * 직접 테스트 데이터 추가 함수
 * @return {object} - 응답 객체
 */
function addTestCompany() {
  try {
    Logger.log("직접 테스트 데이터 추가 시작");
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("기업정보");
    
    if (!sheet) {
      Logger.log("기업정보 시트를 찾을 수 없습니다.");
      return {
        success: false,
        error: "기업정보 시트를 찾을 수 없습니다."
      };
    }
    
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // 테스트 데이터 생성
    const timestamp = new Date().getTime();
    const testData = headers.map(header => {
      if (header === 'id') return 'TEST_' + timestamp;
      if (header === 'comname' || header === '기업명') return '테스트기업_' + timestamp;
      if (header === 'businessNumber' || header === '사업자등록번호') return '123-45-67890';
      if (header === 'representative' || header === '대표자') return '테스트대표';
      if (header === 'phone' || header === '전화번호') return '010-1234-5678';
      if (header === 'email' || header === '이메일') return 'test@example.com';
      if (header === 'registrationDate' || header === 'createdAt' || header === 'updatedAt') return new Date();
      return '테스트_' + header;
    });
    
    Logger.log("추가할 테스트 데이터: " + JSON.stringify(testData));
    
    // 데이터 추가
    sheet.appendRow(testData);
    
    Logger.log("테스트 데이터 추가 성공");
    
    // 업데이트된 데이터 가져오기
    const updatedData = getSheetData("기업정보");
    
    return {
      success: true,
      message: "테스트 데이터가 추가되었습니다.",
      data: {
        added: testData,
        companies: updatedData
      }
    };
  } catch (error) {
    Logger.log("테스트 데이터 추가 오류: " + error.toString());
    return {
      success: false,
      error: "테스트 데이터 추가 중 오류가 발생했습니다: " + error.toString()
    };
  }
}

/**
 * 여러 개의 테스트 데이터 추가 함수
 * @return {object} - 응답 객체
 */
function addMultipleTestCompanies() {
  try {
    Logger.log("다중 테스트 데이터 추가 시작");
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName("기업정보");
    
    if (!sheet) {
      Logger.log("기업정보 시트를 찾을 수 없습니다.");
      return {
        success: false,
        error: "기업정보 시트를 찾을 수 없습니다."
      };
    }
    
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // 여러 테스트 데이터 추가
    let addedCount = 0;
    const addedData = [];
    const timestamp = new Date().getTime();
    const allRows = [];
    
    // 5개의 테스트 기업 데이터 생성
    for (let count = 1; count <= 5; count++) {
      const companyName = "테스트기업_" + timestamp + "_" + count;
      const businessNumber = "123-45-" + (67890 + count);
      
      // 행 데이터 생성
      const rowData = headers.map(header => {
        if (header === 'id') return 'TEST_' + timestamp + '_' + count;
        if (header === 'comname' || header === '기업명') return companyName;
        if (header === 'businessNumber' || header === '사업자등록번호') return businessNumber;
        if (header === 'representative' || header === '대표자') return '테스트대표_' + count;
        if (header === 'phone' || header === '전화번호') return '010-1234-' + (5000 + count);
        if (header === 'email' || header === '이메일') return 'test' + count + '@example.com';
        if (header === 'registrationDate' || header === 'createdAt' || header === 'updatedAt') return new Date();
        return '테스트_' + header + '_' + count;
      });
      
      allRows.push(rowData);
      
      // 요약 정보 저장
      addedData.push({
        name: companyName,
        businessNumber: businessNumber,
        id: 'TEST_' + timestamp + '_' + count
      });
      
      Logger.log("테스트 데이터 " + count + " 준비 완료");
    }
    
    // 한번에 여러 행 추가 (배치 처리)
    if (allRows.length > 0) {
      const range = sheet.getRange(sheet.getLastRow() + 1, 1, allRows.length, headers.length);
      range.setValues(allRows);
      addedCount = allRows.length;
      Logger.log(addedCount + "개의 테스트 데이터 추가 성공");
    }
    
    // 업데이트된 데이터 가져오기
    const updatedData = getSheetData("기업정보");
    
    return {
      success: true,
      message: addedCount + "개의 테스트 데이터가 추가되었습니다.",
      data: {
        addedCount: addedCount,
        added: addedData,
        companies: updatedData
      }
    };
  } catch (error) {
    Logger.log("다중 테스트 데이터 추가 오류: " + error.toString());
    return {
      success: false,
      error: "다중 테스트 데이터 추가 중 오류가 발생했습니다: " + error.toString()
    };
  }
}

/**
 * uploadCompanies - CSV 업로드 처리 함수 (개선)
 * @param {object} data - JSON 객체로 전달된 데이터
 * @return {object} - 응답 객체
 */
function uploadCompanies(data) {
  try {
    // 입력 검증
    if (!data || !data.csvContent) {
      return { 
        success: false, 
        error: 'CSV 데이터가 없습니다' 
      };
    }
    
    const filename = data.filename || '업로드된 CSV';
    Logger.log('CSV 업로드 시작: ' + filename);
    
    // Base64 디코딩
    let csvContent;
    try {
      const decodedBlob = Utilities.newBlob(Utilities.base64Decode(data.csvContent));
      csvContent = decodedBlob.getDataAsString();
    } catch (e) {
      Logger.log('Base64 디코딩 오류: ' + e.message);
      return {
        success: false, 
        error: 'CSV 파일 디코딩에 실패했습니다: ' + e.message
      };
    }
    
    // CSV 파싱
    let csvData;
    try {
      csvData = Utilities.parseCsv(csvContent);
    } catch (e) {
      Logger.log('CSV 파싱 오류: ' + e.message);
      return {
        success: false, 
        error: 'CSV 파일 파싱에 실패했습니다: ' + e.message
      };
    }
    
    // 데이터 검증
    if (!csvData || csvData.length < 2) {
      Logger.log('유효한 CSV 데이터 없음');
      return {
        success: false, 
        error: '유효한 CSV 데이터가 없습니다. 최소 헤더 행과 데이터 행이 필요합니다.'
      };
    }
    
    // 헤더 행
    const headers = csvData[0];
    Logger.log('CSV 헤더: ' + headers.join(', '));
    
    // '기업정보' 시트 가져오기
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName('기업정보');
    
    if (!sheet) {
      Logger.log('기업정보 시트를 찾을 수 없음');
      return {
        success: false, 
        error: '기업정보 시트를 찾을 수 없습니다.'
      };
    }
    
    // 기본 헤더 목록 (시트가 비어있을 경우)
    const defaultHeaders = ['id', 'comname', 'businessNumber', 'representative', 'phone', 'email', 'createdAt', 'updatedAt'];
    
    // 시트가 비어있으면 헤더 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(defaultHeaders);
      Logger.log('빈 시트에 기본 헤더 추가됨');
    }
    
    // 시트 헤더 가져오기
    const sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 헤더 매핑 - CSV 헤더를 시트 헤더에 매핑
    const headerMapping = [];
    const mappedData = [];
    
    // CSV 헤더를 시트 헤더에 매핑
    headers.forEach(csvHeader => {
      const normalizedHeader = csvHeader.trim();
      
      // SHEET_FIELD_MAPPINGS를 사용하여 매핑
      let mappedHeader = null;
      
      // 기업정보 시트의 필드 매핑 가져오기
      const fieldMappings = SHEET_FIELD_MAPPINGS["기업정보"];
      
      // 필드 매핑에서 일치하는 항목 찾기
      if (fieldMappings && fieldMappings[normalizedHeader]) {
        mappedHeader = fieldMappings[normalizedHeader];
      } else if (sheetHeaders.includes(normalizedHeader)) {
        // 직접 일치하는 경우
        mappedHeader = normalizedHeader;
      }
      
      headerMapping.push({
        csvHeader: normalizedHeader,
        sheetHeader: mappedHeader
      });
    });
    
    Logger.log('헤더 매핑: ' + JSON.stringify(headerMapping));
    
    // 데이터 로우 변환
    const dataRows = csvData.slice(1).filter(row => row.join('').trim() !== '');
    Logger.log('유효한 데이터 행 수: ' + dataRows.length);
    
    // 변환된 데이터 행 생성
    dataRows.forEach(row => {
      const mappedRow = new Array(sheetHeaders.length).fill('');
      
      // ID 및 타임스탬프 필드 자동 생성
      const idIndex = sheetHeaders.indexOf('id');
      const createdAtIndex = sheetHeaders.indexOf('createdAt');
      const updatedAtIndex = sheetHeaders.indexOf('updatedAt');
      
      if (idIndex !== -1) mappedRow[idIndex] = Utilities.getUuid();
      if (createdAtIndex !== -1) mappedRow[createdAtIndex] = new Date();
      if (updatedAtIndex !== -1) mappedRow[updatedAtIndex] = new Date();
      
      // CSV 데이터를 시트 형식에 맞게 매핑
      headerMapping.forEach((mapping, index) => {
        if (mapping.sheetHeader && index < row.length) {
          const sheetIndex = sheetHeaders.indexOf(mapping.sheetHeader);
          if (sheetIndex !== -1) {
            mappedRow[sheetIndex] = row[index] || '';
          }
        }
      });
      
      mappedData.push(mappedRow);
    });
    
    // 배치로 데이터 추가
    if (mappedData.length > 0) {
      const lastRow = sheet.getLastRow();
      
      // 한 번에 모든 데이터 추가
      sheet.getRange(lastRow + 1, 1, mappedData.length, sheetHeaders.length)
           .setValues(mappedData);
    }
    
    Logger.log('추가된 행 수: ' + mappedData.length);
    
    // 성공 응답
    return {
      success: true,
      message: mappedData.length + '개의 기업 정보가 추가되었습니다.',
      addedCount: mappedData.length,
      totalHeaders: sheetHeaders.length
    };
    
  } catch (error) {
    Logger.log('업로드 중 오류 발생: ' + error.toString());
    return {
      success: false,
      error: '업로드 중 오류가 발생했습니다: ' + error.toString()
    };
  }
}

/**
 * 안내정보 테스트 - 직접 데이터를 추가하고 확인하는 테스트 함수
 * @return {object} - 응답 객체
 */
function testNotificationInfo() {
  try {
    // 안내정보 시트 가져오기
    let sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("안내정보");
    
    // 시트가 없으면 생성
    if (!sheet) {
      Logger.log("안내정보 시트가 없어 새로 생성합니다.");
      sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("안내정보");
      sheet.appendRow(["id", "businessId", "companyId", "csdataaa", "saupjadd", "createdAt", "updatedAt"]);
    }
    
    // 헤더 확인
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("안내정보 시트 헤더: " + headers.join(", "));
    
    // 테스트 데이터
    const testNotification = {
      businessId: "1",  // 클라우드사업 ID
      companyId: "22ec78c9-a436-460c-a31b-5703ec469ecb",  // 기업 ID
      csdataaa: "등록"
    };
    
    // 데이터 추가
    const id = Utilities.getUuid();
    const newRow = headers.map(header => {
      if (header === 'id') return id;
      if (header === 'createdAt' || header === 'updatedAt') return new Date();
      return testNotification[header] || '';
    });
    
    // 행 추가
    sheet.appendRow(newRow);
    Logger.log("테스트 데이터 추가 완료: " + id);
    
    // 현재 데이터 확인
    const data = sheet.getDataRange().getValues();
    Logger.log("안내정보 시트 전체 행 수: " + data.length);
    
    if (data.length > 1) {
      Logger.log("마지막 데이터: " + JSON.stringify(data[data.length-1]));
    }
    
    return {
      success: true,
      message: "안내정보 테스트 데이터가 추가되었습니다.",
      addedId: id,
      totalRows: data.length - 1,  // 헤더 제외 행 수
      lastRow: data.length > 1 ? data[data.length-1] : null
    };
  } catch (error) {
    Logger.log("안내정보 테스트 중 오류: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 파일을 구글 드라이브에 업로드하고 시트에는 링크만 저장하는 함수
 * @param {string} sheetName - 시트 이름
 * @param {object} data - 업로드할 데이터 및 파일 정보
 * @return {object} - 응답 객체
 */
function uploadFileToDrive(sheetName, data) {
  try {
    Logger.log("구글 드라이브 파일 업로드 시작");
    Logger.log("데이터 객체 키: " + Object.keys(data));
    
    // 필수 데이터 검증
    if (!data || !data.fileContent) {
      return { 
        success: false, 
        error: "파일 데이터가 없습니다" 
      };
    }
    
    // 파일 정보 추출
    const fileName = data.fileName || `파일_${new Date().getTime()}`;
    const fileContent = data.fileContent;
    const mimeType = data.mimeType || getMimeTypeFromFileName(fileName);
    
    Logger.log("파일 정보: " + fileName + ", MIME: " + mimeType);
    
    // 1. Base64 데이터를 디코딩
    let fileBlob;
    try {
      // Base64 접두사 제거 (data:image/jpeg;base64, 등)
      let base64Data = fileContent;
      if (base64Data.indexOf('base64,') !== -1) {
        base64Data = base64Data.split('base64,')[1];
      }
      
      fileBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), mimeType, fileName);
      Logger.log("Base64 디코딩 성공");
    } catch (error) {
      Logger.log("Base64 디코딩 오류: " + error);
      return { success: false, error: "파일 데이터 형식이 올바르지 않습니다: " + error };
    }
    
    // 2. 특정 드라이브 폴더에 저장 (사용자가 지정한 폴더 ID 사용)
    const folderId = data.folderId || "1ezIOGRJH4wYwqGDZPlr6YepfuoGEipWq"; // 사용자 지정 폴더 ID
    let folder;
    
    try {
      folder = DriveApp.getFolderById(folderId);
      Logger.log("폴더 ID: " + folderId + " 사용 중");
    } catch (folderError) {
      Logger.log("지정된 폴더를 찾을 수 없습니다: " + folderError);
      
      // 폴더를 찾을 수 없는 경우 기본 폴더 사용 시도
      try {
        folder = DriveApp.getFolderById("1ezIOGRJH4wYwqGDZPlr6YepfuoGEipWq");
        Logger.log("지정된 폴더를 찾을 수 없어 기본 폴더를 사용합니다.");
      } catch (defaultFolderError) {
        Logger.log("기본 폴더도 찾을 수 없습니다: " + defaultFolderError);
        
        // 마지막 수단으로 루트 폴더 사용
        try {
          folder = DriveApp.getRootFolder();
          Logger.log("기본 폴더도 찾을 수 없어 루트 폴더를 사용합니다.");
        } catch (rootFolderError) {
          Logger.log("루트 폴더 접근 오류: " + rootFolderError);
          return { 
            success: false, 
            error: "폴더를 찾을 수 없습니다. 올바른 폴더 ID를 입력해주세요." 
          };
        }
      }
    }
    
    // 3. 폴더에 파일 생성
    try {
      const file = folder.createFile(fileBlob);
      Logger.log("파일 생성 성공");
      
      // 4. 파일에 대한 공유 설정 (누구나 보기 가능)
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      Logger.log("파일 공유 설정 완료");
      
      // 5. 파일 정보 가져오기
      const fileId = file.getId();
      const fileUrl = file.getUrl();
      const downloadUrl = "https://drive.google.com/uc?export=download&id=" + fileId;
      const viewUrl = "https://drive.google.com/file/d/" + fileId + "/view";
      
      Logger.log("파일 업로드 성공: " + fileName);
      Logger.log("파일 ID: " + fileId);
      Logger.log("파일 URL: " + fileUrl);
      
      // 6. 스프레드시트에 파일 링크 저장 (시트가 존재하는 경우)
      if (sheetName && sheetName !== "direct") {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName(sheetName);
        
        if (sheet) {
          // 기존 데이터에 파일 URL만 추가
          const newData = {
            ...data,
            fileUrl: fileUrl,
            fileId: fileId,
            downloadUrl: downloadUrl,
            viewUrl: viewUrl,
            saupjadd: viewUrl, // business-notification.html에서 사용하는 필드
            folderId: folderId // 폴더 ID도 저장
          };
          
          // 파일 내용은 제거 (용량 축소)
          delete newData.fileContent;
          
          // ID가 있으면 데이터 업데이트, 없으면 새로 추가
          if (data.id) {
            return updateData(sheetName, newData);
          } else {
            return addSingleData(sheet, newData);
          }
        }
      }
      
      // 시트 저장 없이 파일 정보만 반환하는 경우
      return { 
        success: true, 
        message: "파일이 구글 드라이브에 성공적으로 업로드되었습니다.", 
        fileName: fileName,
        fileId: fileId,
        fileUrl: fileUrl,
        downloadUrl: downloadUrl,
        viewUrl: viewUrl,
        folderId: folderId
      };
    } catch (fileError) {
      Logger.log("파일 생성 중 오류: " + fileError);
      return { 
        success: false, 
        error: "파일 생성 중 오류가 발생했습니다: " + fileError.toString() 
      };
    }
  } catch (error) {
    Logger.log("구글 드라이브 파일 업로드 오류: " + error.toString());
    Logger.log("오류 스택: " + (error.stack || "스택 정보 없음"));
    return { 
      success: false, 
      error: "파일 업로드 중 오류가 발생했습니다: " + error.toString(),
      stack: error.stack || "스택 정보 없음"
    };
  }
}

/**
 * 파일 확장자로부터 MIME 타입 추측
 * @param {string} fileName - 파일 이름
 * @return {string} - MIME 타입
 */
function getMimeTypeFromFileName(fileName) {
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
}

/**
 * getData - 데이터 가져오기 함수
 * @param {string} sheetName - 가져올 시트 이름 ('all'인 경우 모든 시트)
 * @return {object} - 응답 객체
 */
function getData(sheetName) {
  const result = { success: true, data: [] };
  
  try {
    if (sheetName === 'all') {
      // 모든 시트 데이터 가져오기
      result.data = {
        companies: getSheetData('기업정보'),
        projects: getSheetData('사업정보'),
        contracts: getSheetData('계약정보'),
        payments: getSheetData('송금정보'),
        notices: getSheetData('안내정보')
      };
    } else {
      // 특정 시트 데이터만 가져오기
      result.data = getSheetData(sheetName);
    }
    return result;
  } catch (error) {
    Logger.log("getData 오류: " + error.toString());
    return { 
      success: false, 
      error: "데이터를 가져오는 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 시트 데이터 가져오기 함수 (최적화 버전)
 * @param {string} sheetName - 가져올 시트 이름
 * @return {Array} - 데이터 배열
 */
function getSheetData(sheetName) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log(sheetName + ' 시트를 찾을 수 없습니다.');
    return [];
  }
  
  const lastRow = sheet.getLastRow();
  const lastCol = sheet.getLastColumn();
  
  // 데이터가 없거나 헤더만 있는 경우
  if (lastRow <= 1 || lastCol === 0) {
    return [];
  }
  
  try {
    const dataRange = sheet.getRange(1, 1, lastRow, lastCol);
    const values = dataRange.getValues();
    const headers = values[0];
    
    // 헤더를 제외한 데이터 행 처리
    return values.slice(1).map(row => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index];
      });
      return item;
    });
  } catch (error) {
    Logger.log("getSheetData 오류: " + error.toString());
    return [];
  }
}

/**
 * 데이터 추가하기 (개선된 버전)
 * @param {string} sheetName - 시트 이름
 * @param {object} data - 추가할 데이터
 * @return {object} - 응답 객체
 */
function addData(sheetName, data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log("오류: 시트를 찾을 수 없음 - " + sheetName);
      return { success: false, error: "지정된 시트를 찾을 수 없습니다" };
    }
    
    // 데이터 형식 검사 및 배열 처리
    if (data.companies && Array.isArray(data.companies)) {
      // 여러 회사 데이터를 배치로 처리
      return addDataBatch(sheetName, data.companies, 'companies');
    } else if (data.notifications && Array.isArray(data.notifications)) {
      // 여러 안내정보 데이터를 배치로 처리
      return addDataBatch(sheetName, data.notifications, 'notifications');
    } else {
      // 단일 데이터 처리
      return addSingleData(sheet, data);
    }
  } catch (error) {
    Logger.log("addData 오류: " + error.toString());
    return { 
      success: false, 
      error: "데이터 추가 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 단일 데이터 추가 함수
 * @param {Sheet} sheet - 스프레드시트 객체
 * @param {object} data - 추가할 데이터
 * @return {object} - 응답 객체
 */
function addSingleData(sheet, data) {
  try {
    Logger.log("단일 데이터 처리 시작: " + JSON.stringify(data));
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더 가져옴: " + headers.join(", "));
    
    const id = Utilities.getUuid();
    const newRow = [];
    
    // 각 헤더에 맞는 데이터 준비
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header === 'id') {
        newRow.push(id);
      } else if (header === 'createdAt') {
        newRow.push(new Date());
      } else if (header === 'updatedAt') {
        newRow.push(new Date());
      } else if (header in data) {
        newRow.push(data[header]);
      } else {
        newRow.push('');
      }
    }
    
    // 데이터 추가
    sheet.appendRow(newRow);
    Logger.log("데이터 추가 성공: " + id + ", 데이터: " + newRow.join(", "));
    
    return { 
      success: true, 
      id: id,
      message: "데이터가 성공적으로 추가되었습니다." 
    };
  } catch (error) {
    Logger.log("단일 데이터 추가 오류: " + error.toString());
    return { 
      success: false, 
      error: "데이터 추가 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 배치 데이터 추가 함수 (개선)
 * @param {string} sheetName - 시트 이름
 * @param {Array} dataArray - 데이터 배열
 * @param {string} dataType - 데이터 타입 ('companies' 또는 'notifications')
 * @param {number} batchSize - 배치 크기
 * @return {object} - 응답 객체
 */
function addDataBatch(sheetName, dataArray, dataType, batchSize = DEFAULT_BATCH_SIZE) {
  try {
    Logger.log(`여러 ${dataType} 데이터 배열 감지: ${dataArray.length}개`);
    
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      return { success: false, error: "시트를 찾을 수 없습니다" };
    }
    
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const results = [];
    const ids = [];
    
    // 데이터 유효성 검사
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return { 
        success: false, 
        error: "유효한 데이터 배열이 아닙니다" 
      };
    }
    
    // 배치 처리
    for (let i = 0; i < dataArray.length; i += batchSize) {
      const batch = dataArray.slice(i, i + batchSize);
      const batchRows = [];
      const batchIds = [];
      
      // 각 배치의 모든 행 준비
      batch.forEach(itemData => {
        const id = Utilities.getUuid();
        batchIds.push(id);
        
        const newRow = [];
        for (let j = 0; j < headers.length; j++) {
          const header = headers[j];
          if (header === 'id') {
            newRow.push(id);
          } else if (header === 'createdAt' || header === 'updatedAt') {
            newRow.push(new Date());
          } else if (header in itemData) {
            newRow.push(itemData[header]);
          } else {
            newRow.push('');
          }
        }
        
        batchRows.push(newRow);
      });
      
      // 데이터가 있으면 한 번에 여러 행 추가
      if (batchRows.length > 0) {
        const lastRow = sheet.getLastRow();
        sheet.getRange(lastRow + 1, 1, batchRows.length, headers.length)
             .setValues(batchRows);
      }
      
      ids.push(...batchIds);
      results.push(...batchIds);
    }
    
    Logger.log(results.length + `개 ${dataType} 추가 완료`);
    
    return { 
      success: true, 
      ids: ids,
      message: results.length + `개 ${dataType}이(가) 성공적으로 추가되었습니다.` 
    };
  } catch (error) {
    Logger.log("배치 데이터 추가 오류: " + error.toString());
    return { 
      success: false, 
      error: "데이터 추가 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

/**
 * 데이터 업데이트하기
 * @param {string} sheetName - 시트 이름
 * @param {object} data - 업데이트할 데이터
 * @return {object} - 응답 객체
 */
function updateData(sheetName, data) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log("오류: 시트를 찾을 수 없음 - " + sheetName);
      return { success: false, error: "지정된 시트를 찾을 수 없습니다" };
    }
    
    // ID 검증
    if (!data.id) {
      Logger.log("오류: 업데이트할 ID가 없음");
      return { success: false, error: "업데이트할 ID가 없습니다" };
    }
    
    // 헤더 가져오기
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // ID 열 인덱스 찾기
    const idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      Logger.log("오류: ID 열을 찾을 수 없음");
      return { success: false, error: "ID 열을 찾을 수 없습니다" };
    }
    
    // 모든 ID 값 가져오기
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) {
      return { success: false, error: "시트에 데이터가 없습니다" };
    }
    
    const idRange = sheet.getRange(2, idColIndex + 1, lastRow - 1, 1);
    const idValues = idRange.getValues();
    
    // ID로 행 찾기
    let rowIndex = -1;
    for (let i = 0; i < idValues.length; i++) {
      if (String(idValues[i][0]) === String(data.id)) {
        rowIndex = i + 2; // 헤더(1) + 인덱스(0부터 시작)
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log("오류: ID에 해당하는 행을 찾을 수 없음 - " + data.id);
      return { success: false, error: "ID에 해당하는 항목을 찾을 수 없습니다" };
    }
    
    // 데이터 업데이트
    const rowData = [];
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i];
      if (header === 'updatedAt') {
        rowData.push(new Date());
      } else if (header in data) {
        // 숫자 필드인 경우 숫자로 변환
        if (header === 'targetCount' || header === 'targetAmount' || header === 'targetCountA') {
          rowData.push(Number(data[header]) || 0);
        } else {
          // selection-confirmation 필드인 경우 특별 처리
          if (header === 'selection-confirmation') {
            Logger.log(`selection-confirmation 값 업데이트: ${data[header]}`);
            rowData.push(data[header]);
          } else {
            rowData.push(data[header]);
          }
        }
      } else {
        // 기존 값 유지
        const cellValue = sheet.getRange(rowIndex, i + 1).getValue();
        rowData.push(cellValue);
      }
    }
    
    // 행 업데이트
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
    
    // 선정정보 시트에도 데이터 저장
    if (data['selection-confirmation']) {
      const selectionSheet = spreadsheet.getSheetByName('선정정보');
      if (selectionSheet) {
        const selectionHeaders = selectionSheet.getRange(1, 1, 1, selectionSheet.getLastColumn()).getValues()[0];
        
        // 선정정보 시트에서 해당 ID 찾기
        const selectionIdColIndex = selectionHeaders.indexOf('id');
        if (selectionIdColIndex !== -1) {
          const selectionLastRow = selectionSheet.getLastRow();
          if (selectionLastRow > 1) {
            const selectionIdRange = selectionSheet.getRange(2, selectionIdColIndex + 1, selectionLastRow - 1, 1);
            const selectionIdValues = selectionIdRange.getValues();
            
            let selectionRowIndex = -1;
            for (let i = 0; i < selectionIdValues.length; i++) {
              if (String(selectionIdValues[i][0]) === String(data.id)) {
                selectionRowIndex = i + 2;
                break;
              }
            }
            
            // 선정정보 데이터 준비
            const selectionData = [];
            for (let i = 0; i < selectionHeaders.length; i++) {
              const header = selectionHeaders[i];
              if (header === 'id') {
                selectionData.push(data.id);
              } else if (header === 'selection-confirmation') {
                selectionData.push(data['selection-confirmation']);
              } else if (header === 'selection-date') {
                selectionData.push(data['selection-date']);
              } else if (header === 'updatedAt') {
                selectionData.push(new Date());
              } else {
                selectionData.push('');
              }
            }
            
            // 행이 있으면 업데이트, 없으면 새로 추가
            if (selectionRowIndex !== -1) {
              selectionSheet.getRange(selectionRowIndex, 1, 1, selectionHeaders.length).setValues([selectionData]);
            } else {
              selectionSheet.appendRow(selectionData);
            }
          } else {
            // 시트가 비어있으면 새로 추가
            const selectionData = selectionHeaders.map(header => {
              if (header === 'id') return data.id;
              if (header === 'selection-confirmation') return data['selection-confirmation'];
              if (header === 'selection-date') return data['selection-date'];
              if (header === 'updatedAt') return new Date();
              return '';
            });
            selectionSheet.appendRow(selectionData);
          }
        }
      }
    }
    
    Logger.log("데이터 업데이트 성공 - ID: " + data.id);
    Logger.log("업데이트된 데이터: " + JSON.stringify(data));
    
    return { 
      success: true, 
      message: "데이터가 성공적으로 업데이트되었습니다." 
    };
  } catch (error) {
    Logger.log("데이터 업데이트 오류: " + error.toString());
    return { 
      success: false, 
      error: "데이터 업데이트 중 오류가 발생했습니다: " + error.toString() 
    };
  }
}

