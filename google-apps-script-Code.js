// Google Apps Script 코드
// 이 코드를 Google 앱스 스크립트에 복사하여 사용하세용가리.

function doGet(e) {
  try {
    // 요청 처리
    e = e || {};
    var params = e.parameter || {};
    var callback = params.callback;
    
    // 디버깅 정보 로깅
    Logger.log("=========================================");
    Logger.log("새 요청 수신 - doGet");
    Logger.log("요청 파라미터: " + JSON.stringify(params));
    Logger.log("콜백: " + callback);
    
    // 테스트 모드 확인
    if (params.test === 'true' || params.test === true) {
      var result = testUploadFile();
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
    var result = handleRequest(e);
    
    // JSONP 형식으로 반환하거나 일반 JSON으로 반환
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify(result) + ")")
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify(result))
        .setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    Logger.log("오류 발생: " + error.toString());
    Logger.log("오류 스택: " + (error.stack || "스택 정보 없음"));
    
    if (callback) {
      return ContentService.createTextOutput(callback + "(" + JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack || "스택 정보 없음"
      }) + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        error: error.toString(),
        stack: error.stack || "스택 정보 없음"
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  try {
    var result = handleRequest(e || {});
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON)
      .addHeader('Access-Control-Allow-Origin', '*');
  } catch (error) {
    Logger.log("오류 발생: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    }))
    .setMimeType(ContentService.MimeType.JSON)
    .addHeader('Access-Control-Allow-Origin', '*');
  }
}

// 앱스 스크립트 웹앱 배포 시 호출되는 함수
function doOptions(e) {
  var headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '1728000'
  };
  
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .addHeader('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .addHeader('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .addHeader('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .addHeader('Access-Control-Max-Age', headers['Access-Control-Max-Age']);
}

function handleRequest(e) {
  try {
    // 요청 파라미터 처리 (null 체크 추가)
    e = e || {};
    var params = e.parameter || {};
    var action = params.action || 'getData';
    var sheet = params.sheet || 'all';
    
    Logger.log("=== 새 요청 시작 ===");
    Logger.log("액션: " + action);
    Logger.log("시트: " + sheet);
    
    var result = {};
    
    // JSONP 요청에서 데이터 파라미터 처리
    var data = {};
    var hasDataParams = false;
    
    // URL 파라미터에서 data_* 접두사를 가진 파라미터 추출
    for (var key in params) {
      if (key.startsWith('data_')) {
        var dataKey = key.substring(5); // 'data_' 접두사 제거
        data[dataKey] = params[key];
        hasDataParams = true;
      }
    }
    
    if (hasDataParams) {
      Logger.log("URL 파라미터에서 추출된 데이터: " + JSON.stringify(data));
    }
    
    // 액션에 따라 처리
    switch(action) {
      case 'getData':
        result = getData(sheet);
        break;
      case 'addData':
        if (hasDataParams) {
          // URL 파라미터에서 추출한 데이터 사용
          Logger.log('데이터 추가 요청 - URL 파라미터로부터: ' + JSON.stringify(data));
          result = addData(sheet, data);
        } else {
          // jsonData 파라미터에서 JSON 데이터 파싱 (기존 방식)
          var jsonData = params.jsonData;
          
          if (!jsonData) {
            Logger.log("오류: jsonData 파라미터가 없습니다");
            return { success: false, error: "데이터가 없습니다" };
          }
          
          try {
            var postData = JSON.parse(decodeURIComponent(jsonData));
            Logger.log('데이터 추가 요청 - 원본: ' + jsonData);
            Logger.log('데이터 추가 요청 - 파싱됨: ' + JSON.stringify(postData));
            result = addData(sheet, postData);
          } catch (parseError) {
            Logger.log("JSON 파싱 오류: " + parseError);
            return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
          }
        }
        break;
      case 'updateData':
        var id = params.id;
        
        if (!id) {
          Logger.log("오류: 업데이트할 ID가 없습니다");
          return { success: false, error: "업데이트할 ID가 없습니다" };
        }
        
        if (hasDataParams) {
          // URL 파라미터에서 추출한 데이터 사용 (ID 추가)
          data.id = id;
          Logger.log('데이터 업데이트 요청 - URL 파라미터로부터: ' + JSON.stringify(data));
          result = updateData(sheet, data);
        } else {
          // jsonData 파라미터에서 JSON 데이터 파싱 (기존 방식)
          var jsonData = params.jsonData;
          
          if (!jsonData) {
            Logger.log("오류: jsonData 파라미터가 없습니다");
            return { success: false, error: "데이터가 없습니다" };
          }
          
          try {
            var postData = JSON.parse(decodeURIComponent(jsonData));
            postData.id = id; // ID 추가
            Logger.log('데이터 업데이트 요청 - 원본: ' + jsonData);
            Logger.log('데이터 업데이트 요청 - 파싱됨: ' + JSON.stringify(postData));
            result = updateData(sheet, postData);
          } catch (parseError) {
            Logger.log("JSON 파싱 오류: " + parseError);
            return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
          }
        }
        break;
      case 'deleteData':
        var id = params.id;
        if (!id) {
          Logger.log("오류: 삭제할 ID가 없습니다");
          return { success: false, error: "삭제할 ID가 없습니다" };
        }
        Logger.log('데이터 삭제 요청 - ID: ' + id);
        result = deleteData(sheet, id);
        break;
      case 'exportToExcel':
        result = exportToExcel(sheet);
        break;
      case 'uploadFile':
        result = uploadFile(e);
        break;
      case 'addTestCompany':
        result = addTestCompany();
        break;
      case 'addMultipleTestCompanies':
        result = addMultipleTestCompanies();
        break;
      case 'uploadCompanies':
        result = uploadCompanies(data);
        break;
      default:
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
      error: error.toString()
    };
  }
}

// getData 함수 구현
function getData(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = { success: true, data: [] };
  
  if (sheetName === 'all') {
    // 모든 시트 데이터 가져오기
    result.data = {
      companies: getSheetData('기업정보'),
      projects: getSheetData('사업정보'),
      contracts: getSheetData('계약정보'),
      payments: getSheetData('송금정보'),
      notices: getSheetData('안내정보')    // 안내정보 시트 추가
    };
  } else {
    // 특정 시트 데이터만 가져오기
    result.data = getSheetData(sheetName);
  }
  
  return result;
}

// 시트 데이터 가져오기 함수
function getSheetData(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    Logger.log(sheetName + ' 시트를 찾을 수 없습니다.');
    return [];
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  if (values.length <= 1) { // 헤더만 있는 경우
    return [];
  }
  
  var headers = values[0];
  var result = [];
  
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var item = {};
    
    for (var j = 0; j < headers.length; j++) {
      item[headers[j]] = row[j];
    }
    
    result.push(item);
  }
  
  return result;
}

// 데이터 추가하기
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
      // 여러 회사 데이터가 배열로 전달된 경우
      Logger.log("여러 기업 데이터 배열 감지: " + data.companies.length + "개");
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const results = [];
      const ids = [];
      
      // 여러 회사 데이터를 순차적으로 처리
      data.companies.forEach(companyData => {
        const id = Utilities.getUuid();
        ids.push(id);
        
        const newRow = [];
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i];
          if (header === 'id') {
            newRow.push(id);
          } else if (header === 'createdAt') {
            newRow.push(new Date());
          } else if (header === 'updatedAt') {
            newRow.push(new Date());
          } else if (header in companyData) {
            newRow.push(companyData[header]);
          } else {
            newRow.push('');
          }
        }
        
        sheet.appendRow(newRow);
        results.push(id);
      });
      
      Logger.log(results.length + "개 기업 추가 완료");
      return { 
        success: true, 
        ids: ids,
        message: results.length + "개 기업이 성공적으로 추가되었습니다." 
      };
    } else {
      // 단일 회사 데이터 처리 (기존 코드)
      Logger.log("단일 기업 데이터 처리 시작");
      
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      const id = Utilities.getUuid();
      const newRow = [];
      
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
      
      sheet.appendRow(newRow);
      Logger.log("데이터 추가 성공: " + id);
      return { success: true, id: id };
    }
  } catch (error) {
    Logger.log("오류 발생: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// 데이터 업데이트
function updateData(sheetName, data) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  Logger.log("====== 데이터 업데이트 시작: " + sheetName + " ======");
  Logger.log("업데이트 데이터: " + JSON.stringify(data));
  
  if (!sheet) {
    Logger.log("오류: 시트를 찾을 수 없음 - " + sheetName);
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  try {
    // 데이터 형식 검증
    if (typeof data !== 'object' || data === null) {
      Logger.log("오류: 데이터가 객체가 아님 - " + typeof data);
      return { success: false, error: "유효하지 않은 데이터 형식입니다" };
    }
    
    if (!data.id) {
      Logger.log("오류: ID가 없음");
      return { success: false, error: "업데이트할 항목의 ID가 없습니다" };
    }
    
    // 헤더 가져오기
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // ID 열 인덱스 찾기
    var idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      Logger.log("오류: ID 열을 찾을 수 없음");
      return { success: false, error: "ID 열을 찾을 수 없습니다" };
    }
    
    // 모든 ID 값 가져오기
    var idRange = sheet.getRange(2, idColIndex + 1, sheet.getLastRow() - 1, 1);
    var idValues = idRange.getValues();
    
    // ID로 행 찾기
    var rowIndex = -1;
    for (var i = 0; i < idValues.length; i++) {
      if (idValues[i][0].toString() === data.id.toString()) {
        rowIndex = i + 2; // 헤더(1) + 인덱스(0부터 시작)
        break;
      }
    }
    
    if (rowIndex === -1) {
      Logger.log("오류: ID에 해당하는 행을 찾을 수 없음 - " + data.id);
      return { success: false, error: "ID에 해당하는 항목을 찾을 수 없습니다" };
    }
    
    // 행 데이터 업데이트
    var rowData = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      rowData.push(data[header] !== undefined ? data[header] : sheet.getRange(rowIndex, i + 1).getValue());
    }
    
    // 데이터 업데이트
    sheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowData]);
    Logger.log("행 업데이트 완료 - 행 " + rowIndex + ": " + JSON.stringify(rowData));
    
    return { 
      success: true, 
      data: data,
      message: "데이터가 성공적으로 업데이트되었습니다." 
    };
  } catch (error) {
    Logger.log("데이터 업데이트 중 오류 발생: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// 데이터 삭제
function deleteData(sheetName, id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
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
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // ID 열 인덱스 찾기
    var idColIndex = headers.indexOf('id');
    if (idColIndex === -1) {
      Logger.log("오류: ID 열을 찾을 수 없음");
      return { success: false, error: "ID 열을 찾을 수 없습니다" };
    }
    
    // 모든 ID 값 가져오기
    var idRange = sheet.getRange(2, idColIndex + 1, sheet.getLastRow() - 1, 1);
    var idValues = idRange.getValues();
    
    // ID로 행 찾기
    var rowIndex = -1;
    for (var i = 0; i < idValues.length; i++) {
      if (idValues[i][0].toString() === id.toString()) {
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
    return { success: false, error: error.toString() };
  }
}

// 엑셀 파일 다운로드
function exportToExcel(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  try {
    // 스프레드시트의 URL 생성
    var url = "https://docs.google.com/spreadsheets/d/" + spreadsheet.getId() + "/export?format=xlsx&gid=" + sheet.getSheetId();
    
    return { success: true, url: url };
  } catch (error) {
    Logger.log("엑셀 내보내기 오류: " + error.toString());
    return { success: false, error: error.toString() };
  }
}

// 시트별 필드 매핑 정의
var sheetFieldMappings = {
  "기업정보": {
    "기업명": "comname",
    "사업자등록번호": "businessNumber",
    "대표자": "representative", 
    "전화번호": "phone",
    "이메일": "email",
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
    "사업아이디": "projectId",
    "계약일": "contractDate",
    "계약금액": "contractAmount",
    "캐시백금액": "cashbackAmount",
    "상태": "status",
    "발주서여부": "hasOrderSheet"
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
    "기업명": "csname",
    "사업자등록번호": "csbusinessNumber",
    "대표자": "csrepresentative",
    "전화번호": "csphone",
    "이메일": "csemail",
    "등록일": "csregistrationDate"
  }
};

// 파일 업로드 - 필드 매핑 로직 추가
function uploadFile(e) {
  try {
    Logger.log("파일 업로드 요청 수신");
    Logger.log("파라미터: " + JSON.stringify(e.parameter));
    
    if (!e.parameter) {
      return { success: false, error: "파라미터가 없습니다" };
    }
    
    // JSON 데이터 파싱
    var jsonData;
    if (e.parameter.data) {
      try {
        jsonData = JSON.parse(decodeURIComponent(e.parameter.data));
        Logger.log("파싱된 데이터: " + JSON.stringify(jsonData));
      } catch (parseError) {
        Logger.log("데이터 파싱 오류: " + parseError);
        return { success: false, error: "데이터 형식이 잘못되었습니다: " + parseError.message };
      }
    } else {
      return { success: false, error: "데이터 파라미터가 없습니다" };
    }
    
    // 파일 데이터 추출
    if (!jsonData.file || !jsonData.file.name || !jsonData.file.content) {
      Logger.log("파일 정보 오류: " + JSON.stringify(jsonData.file || {}));
      return { success: false, error: "파일 정보가 올바르지 않습니다" };
    }
    
    var fileName = jsonData.file.name;
    var fileContent = jsonData.file.content;
    var sheetName = jsonData.sheet || "기업정보";
    var id = jsonData.id || null;
    
    Logger.log("파일명: " + fileName);
    Logger.log("시트명: " + sheetName);
    Logger.log("ID (존재하는 경우): " + id);
    
    // 해당 시트의 필드 매핑 가져오기
    var fieldMapping = sheetFieldMappings[sheetName];
    if (!fieldMapping) {
      Logger.log("경고: " + sheetName + "에 대한 필드 매핑이 정의되지 않았습니다. 기본 처리를 사용합니다.");
      fieldMapping = {};
    }
    
    // Base64 디코딩
    var decodedContent;
    try {
      decodedContent = Utilities.base64Decode(fileContent);
      decodedContent = Utilities.newBlob(decodedContent).getDataAsString();
      Logger.log("파일 콘텐츠 디코딩 성공");
    } catch (decodeError) {
      Logger.log("Base64 디코딩 오류: " + decodeError);
      return { success: false, error: "파일 콘텐츠를 디코딩할 수 없습니다: " + decodeError.message };
    }
    
    // CSV 파싱
    var rows = [];
    try {
      if (fileName.toLowerCase().endsWith('.csv')) {
        // CSV 파일 처리
        rows = Utilities.parseCsv(decodedContent);
        Logger.log("CSV 파싱 결과: " + rows.length + "행");
      } else {
        return { success: false, error: "지원하지 않는 파일 형식입니다. CSV 파일만 지원합니다." };
      }
    } catch (parseError) {
      Logger.log("CSV 파싱 오류: " + parseError);
      return { success: false, error: "CSV 파일을 파싱할 수 없습니다: " + parseError.message };
    }
    
    if (rows.length < 2) { // 헤더 + 최소 1개 데이터 행
      return { success: false, error: "파일에 데이터가 충분하지 않습니다." };
    }
    
    // 헤더 추출 및 검증
    var csvHeaders = rows[0];
    Logger.log("파일 헤더: " + JSON.stringify(csvHeaders));
    
    // 필수 필드 확인 (시트별로 다른 필수 필드 정의)
    var requiredFields;
    if (sheetName === "기업정보") {
      requiredFields = ['기업명', '사업자등록번호'];
    } else if (sheetName === "사업정보") {
      requiredFields = ['사업명', '시작일'];
    } else if (sheetName === "계약정보") {
      requiredFields = ['기업아이디', '사업아이디', '계약일'];
    } else if (sheetName === "송금정보") {
      requiredFields = ['계약아이디', '금액', '송금일'];
    } else {
      requiredFields = []; // 안내정보 등 기타 시트는 필수 필드 없음
    }
    
    var missingFields = [];
    for (var i = 0; i < requiredFields.length; i++) {
      if (csvHeaders.indexOf(requiredFields[i]) === -1) {
        missingFields.push(requiredFields[i]);
      }
    }
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: "파일에 필수 필드가 누락되었습니다: " + missingFields.join(', ')
      };
    }
    
    // 스프레드시트 및 시트 가져오기
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName(sheetName);
    
    if (!sheet) {
      Logger.log("시트를 찾을 수 없음: " + sheetName);
      return { success: false, error: "지정된 시트를 찾을 수 없습니다" };
    }
    
    // 시트 헤더 가져오기
    var sheetHeaders = [];
    if (sheet.getLastColumn() > 0) {
      sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    } else {
      // 빈 시트인 경우 헤더 추가
      // 매핑된 영어 필드명으로 헤더 생성
      var standardizedHeaders = [];
      for (var i = 0; i < csvHeaders.length; i++) {
        var csvHeader = csvHeaders[i];
        // 매핑된 영어 필드명이 있으면 사용, 없으면 원래 헤더 사용
        standardizedHeaders.push(fieldMapping[csvHeader] || csvHeader);
      }
      
      // 필수 시스템 필드 추가
      if (standardizedHeaders.indexOf('id') === -1) standardizedHeaders.push('id');
      if (standardizedHeaders.indexOf('createdAt') === -1) standardizedHeaders.push('createdAt');
      if (standardizedHeaders.indexOf('updatedAt') === -1) standardizedHeaders.push('updatedAt');
      
      sheet.appendRow(standardizedHeaders);
      sheetHeaders = standardizedHeaders;
      Logger.log("빈 시트에 표준화된 헤더 추가: " + JSON.stringify(standardizedHeaders));
    }
    
    Logger.log("시트 헤더: " + JSON.stringify(sheetHeaders));
    
    // 헤더 매핑 생성 (CSV 헤더 -> 시트 헤더)
    var headerMapping = {};
    for (var i = 0; i < csvHeaders.length; i++) {
      var csvHeader = csvHeaders[i];
      // 매핑된 영어 필드명이 있으면 사용, 없으면 원래 헤더 사용
      var mappedHeader = fieldMapping[csvHeader];
      // 시트 헤더에 있는지 확인
      if (sheetHeaders.indexOf(mappedHeader) !== -1) {
        headerMapping[csvHeader] = mappedHeader;
      } else {
        Logger.log("경고: CSV 헤더 '" + csvHeader + "'에 대한 매핑된 필드 '" + mappedHeader + "'가 시트 헤더에 없습니다.");
      }
    }
    
    Logger.log("헤더 매핑: " + JSON.stringify(headerMapping));
    
    // 데이터 추가
    var addedCount = 0;
    var errors = [];
    
    // 각 데이터 행 처리
    for (var i = 1; i < rows.length; i++) {
      try {
        var rowData = rows[i];
        
        // 빈 행 건너뛰기
        if (rowData.join('').trim() === '') {
          Logger.log("빈 행 건너뛰기: " + i);
          continue;
        }
        
        var dataObject = {};
        
        // CSV 행 데이터를 객체로 변환 (매핑 적용)
        for (var j = 0; j < csvHeaders.length; j++) {
          if (j < rowData.length) {
            // 공백, null, undefined를 빈 문자열로 처리
            var value = rowData[j];
            if (value === null || value === undefined || (typeof value === 'string' && value.trim() === '')) {
              value = '';
            }
            
            var csvHeader = csvHeaders[j];
            var mappedHeader = headerMapping[csvHeader];
            
            if (mappedHeader) {
              dataObject[mappedHeader] = value;
            } else {
              // 매핑되지 않은 필드는 원래 이름 사용
              dataObject[csvHeader] = value;
            }
          }
        }
        
        // 기본 필드 검증
        var primaryField = (sheetName === "기업정보") ? "comname" : 
                          (sheetName === "사업정보") ? "name" : 
                          (sheetName === "계약정보") ? "companyId" : 
                          (sheetName === "송금정보") ? "contractId" : "title";
        
        if (!dataObject[primaryField] || String(dataObject[primaryField]).trim() === '') {
          Logger.log("주요 필드 누락, 행 " + (i+1) + " 건너뛰기: " + primaryField);
          errors.push("행 " + (i+1) + ": " + primaryField + " 필드가 누락되었습니다");
          continue;
        }
        
        Logger.log("추가할 데이터: " + JSON.stringify(dataObject));
        
        // 데이터 변환 (시트 헤더에 맞게)
        var newRowData = [];
        for (var k = 0; k < sheetHeaders.length; k++) {
          var header = sheetHeaders[k];
          if (header === 'id') {
            newRowData.push(Utilities.getUuid()); // 새 ID 생성
          } else if (header === 'createdAt' || header === 'registrationDate') {
            newRowData.push(new Date()); // 현재 날짜
          } else if (header === 'updatedAt') {
            newRowData.push(new Date()); // 현재 날짜
          } else if (dataObject[header] !== undefined) {
            newRowData.push(dataObject[header]); // 파일에서 가져온 데이터
          } else {
            newRowData.push(''); // 없는 필드는 빈 값
          }
        }
        
        // 실제 데이터 추가 (시트에 행 추가)
        sheet.appendRow(newRowData);
        addedCount++;
        Logger.log("행 추가 성공: " + JSON.stringify(newRowData));
        
      } catch (rowError) {
        errors.push("행 " + (i+1) + " 처리 중 오류: " + rowError.message);
        Logger.log("행 처리 오류, 행 " + (i+1) + ": " + rowError.message);
      }
    }
    
    Logger.log("데이터 업로드 완료: " + addedCount + "개 항목 추가됨");
    
    // 데이터 처리 결과 로깅
    Logger.log("=== 파일 업로드 결과 요약 ===");
    Logger.log("총 행 수: " + (rows.length - 1));
    Logger.log("추가된 행 수: " + addedCount);
    Logger.log("오류 수: " + errors.length);
    Logger.log("=== 파일 업로드 완료 ===");
    
    // 최신 시트 데이터 가져오기
    var updatedData = getSheetData(sheetName);
    Logger.log("업데이트된 데이터 수: " + updatedData.length);
    
    // 결과 반환 - 해당 시트의 데이터만 반환
    return { 
      success: true,
      addedCount: addedCount,                     // ✅ 프론트에서 바로 쓸 수 있게 추가
      duplicateCount: rows.length - 1 - addedCount, // ✅ 전체에서 추가한 수 빼면 중복 수
      companies: getSheetData(sheetName),         // ✅ data 안 말고 바깥으로 보냄
      fileName: fileName,
      totalRows: rows.length - 1,
      errors: errors,
      message: addedCount + "개의 데이터가 성공적으로 업로드되었습니다."
    };
    
  } catch (error) {
    Logger.log("파일 업로드 오류: " + error.toString());
    Logger.log("스택 추적: " + error.stack);
    return { success: false, error: error.toString() };
  }
}

// 테스트용 함수 - 파일 업로드 테스트
function testUploadFile() {
  try {
    Logger.log("==== 테스트 파일 업로드 함수 시작 ====");
    
    // 스프레드시트 정보 확인
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheetList = spreadsheet.getSheets();
    var sheetNames = [];
    
    for (var i = 0; i < sheetList.length; i++) {
      sheetNames.push(sheetList[i].getName());
    }
    
    Logger.log("스프레드시트 ID: " + spreadsheet.getId());
    Logger.log("시트 목록: " + JSON.stringify(sheetNames));
    
    // 기업정보 시트 테스트
    var companySheet = spreadsheet.getSheetByName("기업정보");
    var companyData = [];
    
    if (companySheet) {
      var lastRow = companySheet.getLastRow();
      var lastCol = companySheet.getLastColumn();
      
      Logger.log("기업정보 시트 존재: 마지막 행 " + lastRow + ", 마지막 열 " + lastCol);
      
      if (lastRow > 0 && lastCol > 0) {
        var companyHeaders = companySheet.getRange(1, 1, 1, lastCol).getValues()[0];
        Logger.log("기업정보 헤더: " + JSON.stringify(companyHeaders));
        
        // 몇 개의 데이터 샘플 가져오기
        if (lastRow > 1) {
          var sampleRows = companySheet.getRange(2, 1, Math.min(lastRow - 1, 3), lastCol).getValues();
          for (var i = 0; i < sampleRows.length; i++) {
            var row = sampleRows[i];
            var rowData = {};
            
            for (var j = 0; j < companyHeaders.length; j++) {
              rowData[companyHeaders[j]] = row[j];
            }
            
            companyData.push(rowData);
          }
          
          Logger.log("기업정보 샘플 데이터: " + JSON.stringify(companyData));
        }
      }
    } else {
      Logger.log("기업정보 시트 없음");
    }
    
    // 테스트 데이터 생성
    var testCSV = "기업명,사업자등록번호,대표자,전화번호,이메일\n테스트기업,123456789,테스트대표,010-1234-5678,test@test.com";
    var testRows = Utilities.parseCsv(testCSV);
    
    Logger.log("테스트 CSV 데이터: " + JSON.stringify(testRows));
    
    // 행 추가 테스트 (실제로 추가하지는 않음)
    if (companySheet) {
      var testRowData = [];
      var headers = companySheet.getRange(1, 1, 1, companySheet.getLastColumn()).getValues()[0];
      
      // 테스트 데이터 생성
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (header === 'id') {
          testRowData.push('TEST_ID_' + new Date().getTime());
        } else if (header === 'name' || header === '기업명') {
          testRowData.push('테스트기업_' + new Date().getTime());
        } else if (header === 'businessNumber' || header === '사업자등록번호') {
          testRowData.push('123-45-67890');
        } else if (header === 'registrationDate' || header === 'createdAt') {
          testRowData.push(new Date());
        } else {
          testRowData.push('테스트_' + header);
        }
      }
      
      Logger.log("추가할 테스트 행 데이터: " + JSON.stringify(testRowData));
      
      // 실제 추가 없이 시뮬레이션만
      Logger.log("시트에 행 추가 권한 테스트 중...");
      
      try {
        // 테스트 목적으로만 임시로 행을 추가한 후 즉시 삭제 (권한 확인용)
        var lastRow = companySheet.getLastRow();
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

// 직접 테스트 데이터 추가 함수
function addTestCompany() {
  try {
    Logger.log("직접 테스트 데이터 추가 시작");
    
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("기업정보");
    
    if (!sheet) {
      Logger.log("기업정보 시트를 찾을 수 없습니다.");
      return {
        success: false,
        error: "기업정보 시트를 찾을 수 없습니다."
      };
    }
    
    // 헤더 가져오기
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // 테스트 데이터 생성
    var testData = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      if (header === 'id') {
        testData.push('TEST_' + new Date().getTime());
      } else if (header === 'name' || header === '기업명') {
        testData.push('테스트기업_' + new Date().getTime());
      } else if (header === 'businessNumber' || header === '사업자등록번호') {
        testData.push('123-45-67890');
      } else if (header === 'representative' || header === '대표자') {
        testData.push('테스트대표');
      } else if (header === 'phone' || header === '전화번호') {
        testData.push('010-1234-5678');
      } else if (header === 'email' || header === '이메일') {
        testData.push('test@example.com');
      } else if (header === 'registrationDate' || header === 'createdAt') {
        testData.push(new Date());
      } else {
        testData.push('테스트_' + header);
      }
    }
    
    Logger.log("추가할 테스트 데이터: " + JSON.stringify(testData));
    
    // 데이터 추가
    sheet.appendRow(testData);
    
    Logger.log("테스트 데이터 추가 성공");
    
    // 업데이트된 데이터 가져오기
    var updatedData = getSheetData("기업정보");
    
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

// 여러 개의 테스트 데이터 추가 함수
function addMultipleTestCompanies() {
  try {
    Logger.log("다중 테스트 데이터 추가 시작");
    
    var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = spreadsheet.getSheetByName("기업정보");
    
    if (!sheet) {
      Logger.log("기업정보 시트를 찾을 수 없습니다.");
      return {
        success: false,
        error: "기업정보 시트를 찾을 수 없습니다."
      };
    }
    
    // 헤더 가져오기
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("헤더: " + JSON.stringify(headers));
    
    // 여러 테스트 데이터 추가
    var addedCount = 0;
    var addedData = [];
    var timestamp = new Date().getTime();
    
    // 5개의 테스트 기업 데이터 추가
    for (var count = 1; count <= 5; count++) {
      // 테스트 데이터 생성
      var testData = [];
      var companyName = "테스트기업_" + timestamp + "_" + count;
      var businessNumber = "123-45-" + (67890 + count);
      
      for (var i = 0; i < headers.length; i++) {
        var header = headers[i];
        if (header === 'id') {
          testData.push('TEST_' + timestamp + '_' + count);
        } else if (header === 'comname' || header === '기업명') {
          testData.push(companyName);
        } else if (header === 'businessNumber' || header === '사업자등록번호') {
          testData.push(businessNumber);
        } else if (header === 'representative' || header === '대표자') {
          testData.push('테스트대표_' + count);
        } else if (header === 'phone' || header === '전화번호') {
          testData.push('010-1234-' + (5000 + count));
        } else if (header === 'email' || header === '이메일') {
          testData.push('test' + count + '@example.com');
        } else if (header === 'registrationDate' || header === 'createdAt') {
          testData.push(new Date());
        } else {
          testData.push('테스트_' + header + '_' + count);
        }
      }
      
      Logger.log("추가할 테스트 데이터 " + count + ": " + JSON.stringify(testData));
      
      try {
        // 데이터 추가
        sheet.appendRow(testData);
        addedCount++;
        
        // 요약 정보 저장
        addedData.push({
          name: companyName,
          businessNumber: businessNumber
        });
        
        Logger.log("테스트 데이터 " + count + " 추가 성공");
      } catch (rowError) {
        Logger.log("테스트 데이터 " + count + " 추가 실패: " + rowError.toString());
      }
    }
    
    // 업데이트된 데이터 가져오기
    var updatedData = getSheetData("기업정보");
    
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
 * uploadCompanies - 간단한 CSV 업로드 처리 함수
 * 
 * CSV 데이터를 받아서 '기업정보' 시트에 추가하는 함수
 * 
 * @param {object} data - JSON 객체로 전달된 데이터
 * @param {string} data.csvContent - Base64로 인코딩된 CSV 내용
 * @param {string} data.filename - 업로드된 파일 이름
 * @return {object} - 응답 객체
 */
function uploadCompanies(data) {
  try {
    // 로그 기록
    Logger.log('CSV 업로드 시작: ' + data.filename);
    
    // Base64 디코딩
    var csvContent;
    try {
      csvContent = Utilities.newBlob(Utilities.base64Decode(data.csvContent)).getDataAsString();
    } catch (e) {
      Logger.log('Base64 디코딩 오류: ' + e.message);
      return {
        success: false, 
        error: 'CSV 파일 디코딩에 실패했습니다: ' + e.message
      };
    }
    
    // CSV 파싱
    var csvData = Utilities.parseCsv(csvContent);
    
    // 데이터 검증
    if (!csvData || csvData.length < 2) {
      Logger.log('유효한 CSV 데이터 없음');
      return {
        success: false, 
        error: '유효한 CSV 데이터가 없습니다.'
      };
    }
    
    // 헤더 행
    var headers = csvData[0];
    Logger.log('CSV 헤더: ' + headers.join(', '));
    
    // '기업정보' 시트 가져오기
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('기업정보');
    
    if (!sheet) {
      Logger.log('기업정보 시트를 찾을 수 없음');
      return {
        success: false, 
        error: '기업정보 시트를 찾을 수 없습니다.'
      };
    }
    
    // 시트 데이터 가져오기
    var sheetHeaders = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // 기본 헤더 목록 (없는 경우를 위한)
    var defaultHeaders = ['기업명', '사업자등록번호', '대표자', '전화번호', '이메일'];
    
    // 시트에 헤더가 없으면 추가
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(defaultHeaders);
      sheetHeaders = defaultHeaders;
    }
    
    // 데이터 로우 처리
    var addedRows = 0;
    
    // 헤더 행을 제외한 데이터 행만 처리
    for (var i = 1; i < csvData.length; i++) {
      var row = csvData[i];
      
      // 빈 행 건너뛰기
      if (row.join('').trim() === '') continue;
      
      // 행 데이터 추가
      try {
        sheet.appendRow(row);
        addedRows++;
      } catch (e) {
        Logger.log('행 추가 오류: ' + e.message);
      }
    }
    
    Logger.log('추가된 행 수: ' + addedRows);
    
    // 성공 응답
    return {
      success: true,
      message: addedRows + '개의 기업 정보가 추가되었습니다.'
    };
    
  } catch (e) {
    Logger.log('오류 발생: ' + e.message);
    return {
      success: false,
      error: '처리 중 오류가 발생했습니다: ' + e.message
    };
  }
} 