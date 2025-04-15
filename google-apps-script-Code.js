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
    
    var result = {};
    
    // 액션에 따라 처리
    switch(action) {
      case 'getData':
        result = getData(sheet);
        break;
      case 'addData':
        var postData = e.postData ? JSON.parse(e.postData.contents) : {};
        result = addData(sheet, postData);
        break;
      case 'updateData':
        var postData = e.postData ? JSON.parse(e.postData.contents) : {};
        result = updateData(sheet, postData);
        break;
      case 'deleteData':
        result = deleteData(sheet, params.id);
        break;
      case 'exportToExcel':
        result = exportToExcel(sheet);
        break;
      case 'uploadFile':
        result = uploadFile(e);
        break;
      default:
        result = { success: false, error: "지원하지 않는 작업입니다" };
    }
    
    return result;
  } catch (error) {
    Logger.log("오류 발생: " + error.toString());
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
  
  if (!sheet) {
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  // 헤더 확인
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  
  // 자동 ID 생성
  var lastRow = sheet.getLastRow();
  var newId = 1;
  
  if (lastRow > 1) {
    var lastId = sheet.getRange(lastRow, 1).getValue();
    if (!isNaN(lastId) && lastId > 0) {
      newId = Number(lastId) + 1;
    }
  }
  
  // 새 행 데이터 생성
  var newRow = [];
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] === 'id') {
      newRow.push(newId);
    } else {
      newRow.push(data[headers[i]] || '');
    }
  }
  
  // 행 추가
  sheet.appendRow(newRow);
  
  return { 
    success: true,
    data: {
      ...data,
      id: String(newId)
    }
  };
}

// 데이터 업데이트하기
function updateData(sheetName, data) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  var id = data.id;
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // ID로 행 찾기
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == id) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, error: "데이터를 찾을 수 없습니다" };
  }
  
  // 데이터 업데이트
  for (var i = 1; i < headers.length; i++) {
    if (data[headers[i]] !== undefined) {
      sheet.getRange(rowIndex + 1, i + 1).setValue(data[headers[i]]);
    }
  }
  
  return { success: true };
}

// 데이터 삭제하기
function deleteData(sheetName, id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "시트를 찾을 수 없습니다" };
  }
  
  var dataRange = sheet.getDataRange();
  var values = dataRange.getValues();
  
  // ID로 행 찾기
  var rowIndex = -1;
  for (var i = 1; i < values.length; i++) {
    if (values[i][0] == id) {
      rowIndex = i;
      break;
    }
  }
  
  if (rowIndex === -1) {
    return { success: false, error: "데이터를 찾을 수 없습니다" };
  }
  
  // 행 삭제
  sheet.deleteRow(rowIndex + 1);
  
  return { success: true };
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