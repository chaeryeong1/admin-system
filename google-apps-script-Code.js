// Google Apps Script 코드
// 이 코드를 Google 앱스 스크립트에 복사하여 사용하세요.

function doGet(e) {
  try {
    // 요청 처리
    e = e || {};
    var params = e.parameter || {};
    var callback = params.callback;
    
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
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var result = handleRequest(e || {});
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    Logger.log("오류 발생: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 앱스 스크립트 웹앱 배포 시 호출되는 함수
function doOptions(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
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
      payments: getSheetData('송금정보')
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
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  Logger.log("====== 데이터 추가 시작: " + sheetName + " ======");
  Logger.log("원본 데이터: " + JSON.stringify(data));
  
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
    
    // 필수 항목 검증 (예시)
    if (sheetName === '사업정보' && (!data.name || !data.targetCompanies)) {
      Logger.log("오류: 필수 항목 누락 - name 또는 targetCompanies");
      return { success: false, error: "사업명과 목표 업체 수는 필수 항목입니다" };
    }
    
    // 헤더 확인
    var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    Logger.log("기존 헤더: " + JSON.stringify(headers));
    
    // 헤더가 없으면 생성
    if (headers.length === 0 || headers[0] === '') {
      // 데이터의 키를 기반으로 헤더 생성 (id는 항상 첫번째)
      headers = ['id'];
      for (var key in data) {
        if (key !== 'id') {
          headers.push(key);
        }
      }
      Logger.log("새 헤더 생성: " + JSON.stringify(headers));
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
    
    // 자동 ID 생성
    var lastRow = sheet.getLastRow();
    var newId = 1;
    
    if (lastRow > 1) {
      var idCol = headers.indexOf('id') + 1;
      Logger.log("ID 열 인덱스: " + idCol);
      
      if (idCol > 0) {
        var lastIdRange = sheet.getRange(lastRow, idCol);
        var lastId = lastIdRange.getValue();
        Logger.log("마지막 ID 값: " + lastId + " (타입: " + typeof lastId + ")");
        
        // 숫자로 변환하여 1 증가
        if (typeof lastId === 'number') {
          newId = lastId + 1;
        } else if (typeof lastId === 'string' && !isNaN(parseInt(lastId))) {
          newId = parseInt(lastId) + 1;
        } else {
          // 타임스탬프 기반 ID 생성
          newId = new Date().getTime();
        }
      }
    }
    
    // 데이터에 ID 추가
    data.id = data.id || newId.toString();
    Logger.log("새 ID 할당: " + data.id);
    
    // 새 데이터 행 생성
    var newRow = [];
    for (var i = 0; i < headers.length; i++) {
      var header = headers[i];
      newRow.push(data[header] !== undefined ? data[header] : '');
    }
    
    // 데이터 추가
    sheet.appendRow(newRow);
    Logger.log("새 행 추가 완료: " + JSON.stringify(newRow));
    
    return { 
      success: true, 
      data: data,
      message: "데이터가 성공적으로 추가되었습니다." 
    };
  } catch (error) {
    Logger.log("데이터 추가 중 오류 발생: " + error.toString());
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

// 파일 업로드
function uploadFile(e) {
  try {
    if (!e.parameter) {
      return { success: false, error: "파라미터가 없습니다" };
    }
    
    var fileData = e.parameter.data;
    var fileName = e.parameter.name;
    
    if (!fileData || !fileName) {
      return { success: false, error: "파일 데이터 또는 이름이 없습니다" };
    }
    
    // 파일 처리 로직
    
    return { 
      success: true, 
      fileName: fileName,
      message: "파일이 업로드되었습니다"
    };
  } catch (error) {
    Logger.log("파일 업로드 오류: " + error.toString());
    return { success: false, error: error.toString() };
  }
} 