// Google Apps Script 코드
// 이 코드를 Google 앱스 스크립트에 복사하여 사용하세요.

function doGet(e) {
  // CORS 헤더 설정
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  var headers = {
    'Access-Control-Allow-Origin': 'https://arkrium-admin.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  // 콜백 파라미터 확인 (null 체크 추가)
  var callback = e && e.parameter && e.parameter.callback;
  
  // 요청 처리
  var result = handleRequest(e || {});
  
  // JSON 결과 생성
  if (callback) {
    // JSONP 형식으로 응답
    output.setContent(callback + "(" + JSON.stringify(result) + ")");
  } else {
    // 일반 JSON 형식으로 응답
    output.setContent(JSON.stringify(result));
  }
  
  return HtmlService.createHtmlOutput()
    .setContent(output.getContent())
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('Content-Type', 'application/json')
    .addMetaTag('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .addMetaTag('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .addMetaTag('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .addMetaTag('Access-Control-Max-Age', headers['Access-Control-Max-Age']);
}

function doPost(e) {
  // CORS 헤더 설정
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  var headers = {
    'Access-Control-Allow-Origin': 'https://arkrium-admin.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  var result = handleRequest(e);
  output.setContent(JSON.stringify(result));
  
  return HtmlService.createHtmlOutput()
    .setContent(output.getContent())
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('Content-Type', 'application/json')
    .addMetaTag('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .addMetaTag('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .addMetaTag('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .addMetaTag('Access-Control-Max-Age', headers['Access-Control-Max-Age']);
}

// 앱스 스크립트 웹앱 배포 시 호출되는 함수
function doOptions(e) {
  var output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  var headers = {
    'Access-Control-Allow-Origin': 'https://arkrium-admin.netlify.app',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400'
  };
  
  output.setContent(JSON.stringify({ status: "success" }));
  
  return HtmlService.createHtmlOutput()
    .setContent(output.getContent())
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('Content-Type', 'application/json')
    .addMetaTag('Access-Control-Allow-Origin', headers['Access-Control-Allow-Origin'])
    .addMetaTag('Access-Control-Allow-Methods', headers['Access-Control-Allow-Methods'])
    .addMetaTag('Access-Control-Allow-Headers', headers['Access-Control-Allow-Headers'])
    .addMetaTag('Access-Control-Max-Age', headers['Access-Control-Max-Age']);
}

function handleRequest(e) {
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

// ... 기존 코드는 그대로 유지 ... 