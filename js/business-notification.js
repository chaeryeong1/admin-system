// 파일 업로드 관련 함수들
function initializeFileUpload() {
  // 파일 업로드 버튼 클릭 이벤트
  document.addEventListener('click', async function(e) {
    if (e.target.closest('.upload-btn')) {
      const button = e.target.closest('.upload-btn');
      const companyId = button.dataset.id;
      await handleFileUpload(companyId);
    }
  });
}

async function handleFileUpload(companyId) {
  try {
    // 구글 드라이브 API 초기화
    await gapi.client.init({
      apiKey: 'YOUR_API_KEY',
      clientId: 'YOUR_CLIENT_ID',
      discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'],
      scope: 'https://www.googleapis.com/auth/drive.file'
    });

    // 파일 선택 다이얼로그 표시
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';
    
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        // 구글 드라이브에 파일 업로드
        const metadata = {
          name: file.name,
          mimeType: file.type,
          parents: ['YOUR_FOLDER_ID'] // 업로드할 구글 드라이브 폴더 ID
        };

        const form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
        form.append('file', file);

        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + gapi.auth.getToken().access_token
          },
          body: form
        });

        const result = await response.json();
        
        if (result.id) {
          // 파일 URL 생성
          const fileUrl = `https://drive.google.com/file/d/${result.id}/view`;
          
          // 서버에 파일 정보 업데이트
          await updateCompanyFile(companyId, fileUrl);
          
          // UI 업데이트
          updateFileUploadUI(companyId, fileUrl);
        }
      } catch (error) {
        console.error('파일 업로드 중 오류 발생:', error);
        alert('파일 업로드에 실패했습니다. 다시 시도해주세요.');
      }
    };

    fileInput.click();
  } catch (error) {
    console.error('구글 드라이브 API 초기화 중 오류 발생:', error);
    alert('파일 업로드 기능을 초기화하는데 실패했습니다.');
  }
}

async function updateCompanyFile(companyId, fileUrl) {
  try {
    const response = await fetch('/api/companies/' + companyId + '/file', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ fileUrl })
    });

    if (!response.ok) {
      throw new Error('서버 업데이트 실패');
    }
  } catch (error) {
    console.error('파일 정보 업데이트 중 오류 발생:', error);
    throw error;
  }
}

function updateFileUploadUI(companyId, fileUrl) {
  const row = document.querySelector(`tr[data-id="${companyId}"]`);
  if (row) {
    const fileCell = row.querySelector('td:last-child');
    fileCell.innerHTML = `
      <button class="file-upload-btn" data-url="${fileUrl}">
        <i class="fas fa-file-upload mr-1"></i>파일 첨부
      </button>
    `;
  }
}

// 페이지 로드 시 파일 업로드 기능 초기화
document.addEventListener('DOMContentLoaded', function() {
  initializeFileUpload();
}); 