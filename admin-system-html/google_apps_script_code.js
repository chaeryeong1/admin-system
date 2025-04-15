// Google Apps Script 코드
// 이 코드를 Google 앱스 스크립트에 복사하여 사용하세요.

function doGet(e) {
  return handleRequest(e);
}

function doPost(e) {
  return handleRequest(e);
}

function handleRequest(e) {
  // CORS 설정
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    // 요청 파라미터 처리
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
        result = addData(sheet, JSON.parse(e.postData.contents));
        break;
      case 'updateData':
        result = updateData(sheet, JSON.parse(e.postData.contents));
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
        result = { success: false, error: "Unknown action" };
    }
    
    output.setContent(JSON.stringify(result));
    return output;
  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      error: error.toString()
    }));
    return output;
  }
}

function getData(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var result = { success: true };
  
  if (sheetName === 'all') {
    // 모든 시트 데이터 가져오기
    result.companies = getSheetData('기업정보');
    result.projects = getSheetData('사업정보');
    result.contracts = getSheetData('계약정보');
    result.transfers = getSheetData('송금정보');
  } else {
    // 특정 시트 데이터만 가져오기
    switch(sheetName) {
      case '기업정보':
        result.companies = getSheetData(sheetName);
        break;
      case '사업정보':
        result.projects = getSheetData(sheetName);
        break;
      case '계약정보':
        result.contracts = getSheetData(sheetName);
        break;
      case '송금정보':
        result.transfers = getSheetData(sheetName);
        break;
      default:
        result = { success: false, error: "Unknown sheet" };
    }
  }
  
  return result;
}

function getSheetData(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
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

function addData(sheetName, data) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    // 시트가 없으면 생성
    sheet = createSheet(sheetName);
  }
  
  // 헤더 확인
  var headers = [];
  if (sheet.getLastRow() > 0) {
    headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  } else {
    // 시트가 비어있으면 기본 헤더 설정
    headers = getDefaultHeaders(sheetName);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }
  
  // 자동 ID 생성
  var lastRow = sheet.getLastRow();
  var newId = 1;
  
  if (lastRow > 1) {
    var lastId = sheet.getRange(lastRow, 1).getValue();
    if (!isNaN(lastId) && lastId > 0) {
      newId = Number(lastId) + 1;
    }
  }
  
  // 데이터 행 생성
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
  
  return { success: true, id: newId };
}

function updateData(sheetName, data) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "Sheet not found" };
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
    return { success: false, error: "Record not found" };
  }
  
  // 데이터 업데이트
  for (var i = 0; i < headers.length; i++) {
    if (headers[i] !== 'id' && data[headers[i]] !== undefined) {
      sheet.getRange(rowIndex + 1, i + 1).setValue(data[headers[i]]);
    }
  }
  
  return { success: true, id: id };
}

function deleteData(sheetName, id) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "Sheet not found" };
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
    return { success: false, error: "Record not found" };
  }
  
  // 행 삭제
  sheet.deleteRow(rowIndex + 1);
  
  return { success: true };
}

function createSheet(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.insertSheet(sheetName);
  return sheet;
}

function getDefaultHeaders(sheetName) {
  switch(sheetName) {
    case '기업정보':
      return ['id', 'name', 'businessNumber', 'contactPerson', 'contact', 'email', 'registrationDate'];
    case '사업정보':
      return ['id', 'name', 'target', 'startDate', 'endDate', 'organizer', 'noticeUrl'];
    case '계약정보':
      return ['id', 'companyId', 'projectId', 'contractDate', 'contractAmount', 'cashbackAmount', 'status', 'hasOrderSheet'];
    case '송금정보':
      return ['id', 'contractId', 'requestDate', 'approvalDate', 'transferDate', 'amount', 'status', 'requestorId', 'approverId', 'bankName', 'accountNumber', 'accountHolder', 'bankImageUrl', 'requestMemo', 'approvalMemo', 'transferImageUrl', 'rejectReason'];
    default:
      return ['id', 'name'];
  }
}

function exportToExcel(sheetName) {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = spreadsheet.getSheetByName(sheetName);
  
  if (!sheet) {
    return { success: false, error: "Sheet not found" };
  }
  
  // 임시 스프레드시트 생성
  var tempSpreadsheet = SpreadsheetApp.create("Temp_" + sheetName);
  var tempSheet = tempSpreadsheet.getSheets()[0];
  
  // 데이터 복사
  var data = sheet.getDataRange().getValues();
  tempSheet.getRange(1, 1, data.length, data[0].length).setValues(data);
  
  // 파일 ID 가져오기
  var fileId = tempSpreadsheet.getId();
  
  // 엑셀 파일로 내보내기 URL
  var url = "https://docs.google.com/spreadsheets/d/" + fileId + "/export?format=xlsx";
  
  return { success: true, url: url };
}

// 파일 업로드 처리 함수
function uploadFile(e) {
  try {
    var fileBlob = e.parameter.file;
    if (!fileBlob) {
      return { success: false, error: "No file found" };
    }
    
    var folder = DriveApp.getRootFolder(); // 기본 루트 폴더에 저장
    var file = folder.createFile(fileBlob);
    var fileUrl = file.getUrl();
    
    return { success: true, fileUrl: fileUrl };
  } catch (error) {
    return { success: false, error: error.toString() };
  }
} 