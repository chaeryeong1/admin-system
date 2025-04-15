// êµ¬ê? ?¤í¬ë¦½íŠ¸ API URL
const API_URL = 'https://script.google.com/macros/s/AKfycbztFR3HhNcCQGMKbiSXWz0unmxNzaGtQm5RvcbpFdO2sCcvMHhE-zeAhULJfuUWFek/exec';

// ì§„í–‰ ì¤‘ì¸ ?”ì²­ ê´€ë¦?(ì¤‘ë³µ ?”ì²­ ë°©ì???
let pendingRequests = {};

// ?œíŠ¸ ?´ë¦„ ë§µí•‘ ?¨ìˆ˜
function getActualSheetName(sheet) {
  const sheetMapping = {
    '?¬ì—…?•ë³´': '?¬ì—…?•ë³´',
    'ê¸°ì—…?•ë³´': 'ê¸°ì—…?•ë³´',
    'ê³„ì•½ê¸ˆìˆ˜??: 'ê³„ì•½?•ë³´', 
    '?¡ê¸ˆ?•ë³´': '?¡ê¸ˆ?•ë³´',
    '?ˆë‚´?•ë³´': '?ˆë‚´?•ë³´',
    'all': 'all'
  };
  
  return sheetMapping[sheet] || sheet;
}

// ?°ì´??ê°€?¸ì˜¤ê¸?(??ƒ ?¤ì‹œê°??°ì´??
async function fetchData(sheet = 'all') {
  // ì¤‘ë³µ ?”ì²­ ë°©ì? (?™ì¼???”ì²­???´ë? ì§„í–‰ ì¤‘ì´ë©??´ë‹¹ ?„ë¡œë¯¸ìŠ¤ ë°˜í™˜)
  if (pendingRequests[sheet]) {
    return pendingRequests[sheet];
  }
  
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ?˜ì´ì§€??ë¡œë”© ?œì‹œê¸?ì¶”ê?
    const loadingId = 'loading-indicator-' + Date.now();
    const loadingElem = document.createElement('div');
    loadingElem.id = loadingId;
    loadingElem.style.position = 'fixed';
    loadingElem.style.top = '50%';
    loadingElem.style.left = '50%';
    loadingElem.style.transform = 'translate(-50%, -50%)';
    loadingElem.style.background = 'rgba(0,0,0,0.7)';
    loadingElem.style.color = 'white';
    loadingElem.style.padding = '20px';
    loadingElem.style.borderRadius = '10px';
    loadingElem.style.zIndex = '9999';
    loadingElem.textContent = '?°ì´?°ë? ê°€?¸ì˜¤??ì¤?..';
    document.body.appendChild(loadingElem);
    
    // JSONPë¥??¬ìš©?˜ì—¬ ?°ì´??ê°€?¸ì˜¤ê¸?
    pendingRequests[sheet] = new Promise((resolve, reject) => {
      const callbackName = 'callback_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=getData&sheet=${encodeURIComponent(actualSheet)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
      
      // ì½œë°± ?¨ìˆ˜ ?•ì˜
      window[callbackName] = function(data) {
        // ë©”ëª¨ë¦??•ë¦¬
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        // ?”ì²­ ?„ë£Œ ?œì‹œ
        delete pendingRequests[sheet];
        
        // ?°ì´??ë°˜í™˜
        resolve(data);
      };
      
      // ?¤í¬ë¦½íŠ¸ ?œê·¸ ?ì„± ë°?ì¶”ê?
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // ?¤ë¥˜ ì²˜ë¦¬
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        // ?”ì²­ ?„ë£Œ ?œì‹œ
        delete pendingRequests[sheet];
        
        // ?ëŸ¬ ë©”ì‹œì§€ ?œì‹œ
        
        
        // ë¹??°ì´??ë°˜í™˜
        resolve({
          success: false,
          error: '?°ì´?°ë? ê°€?¸ì˜¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
          data: []
        });
      };
      
      // ?€?„ì•„???¤ì • (10ì´?
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // ë¡œë”© ?œì‹œê¸??œê±°
          if (document.getElementById(loadingId)) {
            document.body.removeChild(document.getElementById(loadingId));
          }
          
          // ?”ì²­ ?„ë£Œ ?œì‹œ
          delete pendingRequests[sheet];
          
          // ?€?„ì•„??ë©”ì‹œì§€ ?œì‹œ
          
          
          // ë¹??°ì´??ë°˜í™˜
          resolve({
            success: false,
            error: '?°ì´???”ì²­ ?œê°„??ì´ˆê³¼?˜ì—ˆ?µë‹ˆ??',
            data: []
          });
        }
      }, 10000);
      
      // ?±ê³µ ???€?„ì•„???œê±°
      const originalCallback = window[callbackName];
      window[callbackName] = function(data) {
        clearTimeout(timeoutId);
        originalCallback(data);
      };
      
      document.head.appendChild(script);
    });
    
    return pendingRequests[sheet];
  } catch (error) {
    // ?”ì²­ ?„ë£Œ ?œì‹œ
    delete pendingRequests[sheet];
    
    // ?ëŸ¬ ë©”ì‹œì§€ ë°˜í™˜
    return {
      success: false,
      error: '?°ì´?°ë? ê°€?¸ì˜¤??ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
      data: []
    };
  }
}

// ?°ì´??ì¶”ê??˜ê¸°
async function addData(sheet, data) {
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ?°ì´??ê²€ì¦?
    if (!data || typeof data !== 'object') {
      throw new Error('ì¶”ê????°ì´?°ê? ?†ê±°???•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.');
    }
    
    // ë¡œë”© ?œì‹œê¸?ì¶”ê?
    const loadingId = 'loading-indicator-' + Date.now();
    const loadingElem = document.createElement('div');
    loadingElem.id = loadingId;
    loadingElem.style.position = 'fixed';
    loadingElem.style.top = '50%';
    loadingElem.style.left = '50%';
    loadingElem.style.transform = 'translate(-50%, -50%)';
    loadingElem.style.background = 'rgba(0,0,0,0.7)';
    loadingElem.style.color = 'white';
    loadingElem.style.padding = '20px';
    loadingElem.style.borderRadius = '10px';
    loadingElem.style.zIndex = '9999';
    loadingElem.textContent = '?°ì´?°ë? ì¶”ê??˜ëŠ” ì¤?..';
    document.body.appendChild(loadingElem);
    
    // CORS ?°íšŒë¥??„í•œ JSONP ë°©ì‹ ?¬ìš©
    return new Promise((resolve, reject) => {
      const callbackName = 'add_' + Math.floor(Math.random() * 1000000);
      
      // ?°ì´?°ë? URL ?Œë¼ë¯¸í„°ë¡?ë³€??
      const dataParams = Object.entries(data).map(([key, value]) => {
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');
      
      const apiUrl = `${API_URL}?action=addData&sheet=${encodeURIComponent(actualSheet)}&${dataParams}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
      
      // ì½œë°± ?¨ìˆ˜ ?•ì˜
      window[callbackName] = function(response) {
        // ë©”ëª¨ë¦??•ë¦¬
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        resolve(response);
      };
      
      // ?¤í¬ë¦½íŠ¸ ?œê·¸ ?ì„± ë°?ì¶”ê?
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // ?¤ë¥˜ ì²˜ë¦¬
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        // ?ëŸ¬ ë©”ì‹œì§€ ?œì‹œ
        
        
        resolve({
          success: false,
          error: '?°ì´?°ë? ì¶”ê??˜ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
          data: null
        });
      };
      
      // ?€?„ì•„???¤ì • (10ì´?
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // ë¡œë”© ?œì‹œê¸??œê±°
          if (document.getElementById(loadingId)) {
            document.body.removeChild(document.getElementById(loadingId));
          }
          
          // ?€?„ì•„??ë©”ì‹œì§€ ?œì‹œ
          
          
          resolve({
            success: false,
            error: '?°ì´??ì¶”ê? ?”ì²­ ?œê°„??ì´ˆê³¼?˜ì—ˆ?µë‹ˆ??',
            data: null
          });
        }
      }, 10000);
      
      // ?±ê³µ ???€?„ì•„???œê±°
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

// ?°ì´???…ë°?´íŠ¸?˜ê¸°
async function updateData(sheet, id, data) {
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ID?€ ?°ì´??ê²€ì¦?
    if (!id) {
      throw new Error('?…ë°?´íŠ¸??IDê°€ ?†ìŠµ?ˆë‹¤.');
    }
    
    if (!data || typeof data !== 'object') {
      throw new Error('?…ë°?´íŠ¸???°ì´?°ê? ?†ê±°???•ì‹???¬ë°”ë¥´ì? ?ŠìŠµ?ˆë‹¤.');
    }
    
    // ë¡œë”© ?œì‹œê¸?ì¶”ê?
    const loadingId = 'loading-indicator-' + Date.now();
    const loadingElem = document.createElement('div');
    loadingElem.id = loadingId;
    loadingElem.style.position = 'fixed';
    loadingElem.style.top = '50%';
    loadingElem.style.left = '50%';
    loadingElem.style.transform = 'translate(-50%, -50%)';
    loadingElem.style.background = 'rgba(0,0,0,0.7)';
    loadingElem.style.color = 'white';
    loadingElem.style.padding = '20px';
    loadingElem.style.borderRadius = '10px';
    loadingElem.style.zIndex = '9999';
    loadingElem.textContent = '?°ì´?°ë? ?…ë°?´íŠ¸?˜ëŠ” ì¤?..';
    document.body.appendChild(loadingElem);
    
    // CORS ?°íšŒë¥??„í•œ JSONP ë°©ì‹ ?¬ìš©
    return new Promise((resolve, reject) => {
      const callbackName = 'update_' + Math.floor(Math.random() * 1000000);
      
      // ?°ì´?°ë? URL ?Œë¼ë¯¸í„°ë¡?ë³€??
      const dataParams = Object.entries(data).map(([key, value]) => {
        const encodedValue = (value === null || value === undefined) ? '' : encodeURIComponent(value);
        return `data_${key}=${encodedValue}`;
      }).join('&');
      
      const apiUrl = `${API_URL}?action=updateData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&${dataParams}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
      
      // ì½œë°± ?¨ìˆ˜ ?•ì˜
      window[callbackName] = function(response) {
        // ë©”ëª¨ë¦??•ë¦¬
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        resolve(response);
      };
      
      // ?¤í¬ë¦½íŠ¸ ?œê·¸ ?ì„± ë°?ì¶”ê?
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // ?¤ë¥˜ ì²˜ë¦¬
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        // ?ëŸ¬ ë©”ì‹œì§€ ?œì‹œ
        
        
        resolve({
          success: false,
          error: '?°ì´?°ë? ?…ë°?´íŠ¸?˜ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
          data: null
        });
      };
      
      // ?€?„ì•„???¤ì • (10ì´?
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // ë¡œë”© ?œì‹œê¸??œê±°
          if (document.getElementById(loadingId)) {
            document.body.removeChild(document.getElementById(loadingId));
          }
          
          // ?€?„ì•„??ë©”ì‹œì§€ ?œì‹œ
          
          
          resolve({
            success: false,
            error: '?°ì´???…ë°?´íŠ¸ ?”ì²­ ?œê°„??ì´ˆê³¼?˜ì—ˆ?µë‹ˆ??',
            data: null
          });
        }
      }, 10000);
      
      // ?±ê³µ ???€?„ì•„???œê±°
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

// ?°ì´???? œ?˜ê¸°
async function deleteData(sheet, id) {
  try {
    const actualSheet = getActualSheetName(sheet);
    
    // ID ê²€ì¦?
    if (!id) {
      throw new Error('?? œ??IDê°€ ?†ìŠµ?ˆë‹¤.');
    }
    
    
    // CORS ?°íšŒë¥??„í•œ JSONP ë°©ì‹ ?¬ìš©
    return new Promise((resolve, reject) => {
      const callbackName = 'delete_' + Math.floor(Math.random() * 1000000);
      const apiUrl = `${API_URL}?action=deleteData&sheet=${encodeURIComponent(actualSheet)}&id=${encodeURIComponent(id)}&callback=${encodeURIComponent(callbackName)}&nocache=${Date.now()}`;
      
      // ì½œë°± ?¨ìˆ˜ ?•ì˜
      window[callbackName] = function(response) {
        // ë©”ëª¨ë¦??•ë¦¬
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        resolve(response);
      };
      
      // ?¤í¬ë¦½íŠ¸ ?œê·¸ ?ì„± ë°?ì¶”ê?
      const script = document.createElement('script');
      script.id = callbackName;
      script.src = apiUrl;
      
      // ?¤ë¥˜ ì²˜ë¦¬
      script.onerror = () => {
        delete window[callbackName];
        if (document.getElementById(callbackName)) {
          document.head.removeChild(document.getElementById(callbackName));
        }
        
        // ë¡œë”© ?œì‹œê¸??œê±°
        if (document.getElementById(loadingId)) {
          document.body.removeChild(document.getElementById(loadingId));
        }
        
        // ?ëŸ¬ ë©”ì‹œì§€ ?œì‹œ
        
        
        resolve({
          success: false,
          error: '?°ì´?°ë? ?? œ?˜ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
          data: null
        });
      };
      
      // ?€?„ì•„???¤ì • (10ì´?
      const timeoutId = setTimeout(() => {
        if (window[callbackName]) {
          delete window[callbackName];
          if (document.getElementById(callbackName)) {
            document.head.removeChild(document.getElementById(callbackName));
          }
          
          // ë¡œë”© ?œì‹œê¸??œê±°
          if (document.getElementById(loadingId)) {
            document.body.removeChild(document.getElementById(loadingId));
          }
          
          // ?€?„ì•„??ë©”ì‹œì§€ ?œì‹œ
          
          
          resolve({
            success: false,
            error: '?°ì´???? œ ?”ì²­ ?œê°„??ì´ˆê³¼?˜ì—ˆ?µë‹ˆ??',
            data: null
          });
        }
      }, 10000);
      
      // ?±ê³µ ???€?„ì•„???œê±°
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

// ?°ì´??? íš¨??ê²€???¨ìˆ˜
function validateRequired(value, fieldName) {
  if (value === undefined || value === null || value === '') {
    throw new Error(`${fieldName}?€(?? ?„ìˆ˜ ?…ë ¥ ??ª©?…ë‹ˆ??`);
  }
  return true;
}

function validateNumber(value, fieldName) {
  if (isNaN(Number(value))) {
    throw new Error(`${fieldName}?€(?? ?«ìë§??…ë ¥ ê°€?¥í•©?ˆë‹¤.`);
  }
  return true;
}
